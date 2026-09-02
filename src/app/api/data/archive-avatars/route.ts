import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';
import ActivityLogModel from '@/lib/models/ActivityLog';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const [totalWithAvatar, permanentlyArchived] = await Promise.all([
      RecordModel.countDocuments({
        $or: [
          { avatarType: 'With Avatar' },
          { avatarUrl: { $regex: '^https?://', $options: 'i' } },
        ],
      }),
      RecordModel.countDocuments({
        avatarBase64: { $regex: '^data:image/', $options: 'i' },
      }),
    ]);

    const pending = Math.max(0, totalWithAvatar - permanentlyArchived);
    const percentage = totalWithAvatar > 0
      ? Math.round((permanentlyArchived / totalWithAvatar) * 100)
      : 100;

    return NextResponse.json({
      totalWithAvatar,
      permanentlyArchived,
      pending,
      percentage,
      isFullyArchived: pending === 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSessionUser();
    const uploader = session?.name || 'Administrator';

    const url = new URL(request.url);
    const batchLimit = parseInt(url.searchParams.get('limit') || '60', 10);

    // Find records that have an external URL but do NOT have avatarBase64 yet
    const records = await RecordModel.find({
      $and: [
        {
          $or: [
            { avatarUrl: { $regex: '^https?://', $options: 'i' } },
            { avatarOriginalUrl: { $regex: '^https?://', $options: 'i' } },
          ],
        },
        {
          $or: [
            { avatarBase64: { $exists: false } },
            { avatarBase64: '' },
            { avatarBase64: null },
          ],
        },
      ],
    })
      .limit(batchLimit)
      .select('_id name phone avatarUrl avatarOriginalUrl');

    if (records.length === 0) {
      return NextResponse.json({
        message: 'All avatars are already permanently archived in your database!',
        archivedInThisBatch: 0,
        remainingPending: 0,
        isComplete: true,
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const bulkOps: any[] = [];

    // Download in parallel with concurrency limit
    await Promise.all(
      records.map(async (rec) => {
        const targetUrl = rec.avatarOriginalUrl || rec.avatarUrl;
        if (!targetUrl || !targetUrl.startsWith('http')) return;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

          const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            },
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const base64Str = `data:${contentType};base64,${buffer.toString('base64')}`;

            bulkOps.push({
              updateOne: {
                filter: { _id: rec._id },
                update: {
                  $set: {
                    avatarBase64: base64Str,
                    avatarOriginalUrl: targetUrl,
                  },
                },
              },
            });
            successCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      })
    );

    if (bulkOps.length > 0) {
      await RecordModel.bulkWrite(bulkOps);
    }

    const remainingPending = await RecordModel.countDocuments({
      $and: [
        {
          $or: [
            { avatarUrl: { $regex: '^https?://', $options: 'i' } },
            { avatarOriginalUrl: { $regex: '^https?://', $options: 'i' } },
          ],
        },
        {
          $or: [
            { avatarBase64: { $exists: false } },
            { avatarBase64: '' },
            { avatarBase64: null },
          ],
        },
      ],
    });

    if (successCount > 0) {
      await ActivityLogModel.create({
        action: 'Avatars Archived to DB',
        description: `Permanently saved ${successCount} avatar images into MongoDB storage (${remainingPending} remaining)`,
        user: uploader,
        type: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      archivedInThisBatch: successCount,
      failedInThisBatch: failedCount,
      remainingPending,
      isComplete: remainingPending === 0,
    });
  } catch (error: any) {
    console.error('Archive avatars error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
