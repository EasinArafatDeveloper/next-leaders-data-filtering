import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import ShareLinkModel from '@/lib/models/ShareLink';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();

    const { token } = params;
    if (!token || token.trim().length < 8) {
      return NextResponse.json(
        { error: 'Invalid share link format.' },
        { status: 400 }
      );
    }

    const shareLink = await ShareLinkModel.findOne({ token });

    if (!shareLink) {
      return NextResponse.json(
        {
          error: 'Link not found or has been permanently deleted.',
          statusType: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 1. Check if link has expired by time
    if (new Date(shareLink.expiresAt).getTime() < Date.now()) {
      if (!shareLink.isBurned) {
        shareLink.isBurned = true;
        await shareLink.save();
      }
      return NextResponse.json(
        {
          error: 'This secure share link has expired.',
          statusType: 'EXPIRED',
          expiresAt: shareLink.expiresAt,
          isBurned: true,
        },
        { status: 410 }
      );
    }

    // 2. Check if link was already burned / single-use exhausted
    if (shareLink.isBurned || shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        {
          error: 'This single-use secure link has already been opened and burned.',
          statusType: 'BURNED',
          isBurned: true,
          viewCount: shareLink.viewCount,
          maxViews: shareLink.maxViews,
        },
        { status: 410 }
      );
    }

    // 3. If link requires a passcode, prompt the user for passcode first
    if (shareLink.hasPasscode) {
      return NextResponse.json({
        requiresPasscode: true,
        title: shareLink.title,
        recordCount: shareLink.recordCount,
        expiresAt: shareLink.expiresAt,
        maxViews: shareLink.maxViews,
        isOneTime: shareLink.maxViews === 1,
        createdBy: shareLink.createdBy,
      });
    }

    // 4. Record the view & burn if single-use
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown IP';
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    shareLink.viewCount += 1;
    if (shareLink.viewCount >= shareLink.maxViews) {
      shareLink.isBurned = true;
    }
    shareLink.accessLogs.push({
      ip,
      userAgent,
      accessedAt: new Date(),
    });

    await shareLink.save();

    // 5. Generate dynamic session watermark code
    const sessionWatermark = `CONFIDENTIAL • ONE-TIME ACCESS • #${token.slice(4, 10).toUpperCase()} • ${new Date().toISOString().split('T')[0]}`;

    return NextResponse.json({
      success: true,
      title: shareLink.title,
      recordCount: shareLink.recordCount,
      records: shareLink.recordsSnapshot,
      viewCount: shareLink.viewCount,
      maxViews: shareLink.maxViews,
      isOneTime: shareLink.maxViews === 1,
      isBurned: shareLink.isBurned,
      expiresAt: shareLink.expiresAt,
      createdBy: shareLink.createdBy,
      sessionWatermark,
      accessedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching share link:', error);
    return NextResponse.json(
      { error: 'Failed to access secure share link', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();

    const { token } = params;
    const body = await request.json();
    const { passcode } = body || {};

    const shareLink = await ShareLinkModel.findOne({ token });

    if (!shareLink) {
      return NextResponse.json(
        { error: 'Link not found or has been permanently deleted.', statusType: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Expiry check
    if (new Date(shareLink.expiresAt).getTime() < Date.now()) {
      shareLink.isBurned = true;
      await shareLink.save();
      return NextResponse.json(
        { error: 'This secure share link has expired.', statusType: 'EXPIRED', isBurned: true },
        { status: 410 }
      );
    }

    // Burn check
    if (shareLink.isBurned || shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        {
          error: 'This single-use secure link has already been opened and burned.',
          statusType: 'BURNED',
          isBurned: true,
        },
        { status: 410 }
      );
    }

    // Verify Passcode
    if (shareLink.hasPasscode) {
      if (!passcode) {
        return NextResponse.json(
          { error: 'Passcode is required to unlock this data.' },
          { status: 401 }
        );
      }
      const hashedInput = crypto
        .createHash('sha256')
        .update(String(passcode).trim())
        .digest('hex');

      if (hashedInput !== shareLink.passcodeHash) {
        return NextResponse.json(
          { error: 'Incorrect passcode. Access denied.' },
          { status: 401 }
        );
      }
    }

    // Passcode validated -> consume view
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown IP';
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    shareLink.viewCount += 1;
    if (shareLink.viewCount >= shareLink.maxViews) {
      shareLink.isBurned = true;
    }
    shareLink.accessLogs.push({
      ip,
      userAgent,
      accessedAt: new Date(),
    });

    await shareLink.save();

    const sessionWatermark = `CONFIDENTIAL • ONE-TIME ACCESS • #${token.slice(4, 10).toUpperCase()} • ${new Date().toISOString().split('T')[0]}`;

    return NextResponse.json({
      success: true,
      title: shareLink.title,
      recordCount: shareLink.recordCount,
      records: shareLink.recordsSnapshot,
      viewCount: shareLink.viewCount,
      maxViews: shareLink.maxViews,
      isOneTime: shareLink.maxViews === 1,
      isBurned: shareLink.isBurned,
      expiresAt: shareLink.expiresAt,
      createdBy: shareLink.createdBy,
      sessionWatermark,
      accessedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error verifying passcode for share link:', error);
    return NextResponse.json(
      { error: 'Failed to unlock secure share link', message: error.message },
      { status: 500 }
    );
  }
}
