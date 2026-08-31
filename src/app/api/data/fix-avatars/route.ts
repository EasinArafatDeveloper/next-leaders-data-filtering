import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleMigration();
}

export async function POST() {
  return handleMigration();
}

async function handleMigration() {
  try {
    await connectToDatabase();

    const records = await RecordModel.find({}).lean();
    const bulkOps = [];

    for (const rec of records) {
      const updateDoc: any = {};
      const avatarStr = rec.avatarType || '';
      const custom: any = rec.customFields || {};

      if (avatarStr.startsWith('http://') || avatarStr.startsWith('https://')) {
        updateDoc.avatarUrl = avatarStr;
        updateDoc.avatarType = 'With Avatar';
      }

      if (custom.nickname && (!rec.name || rec.name.startsWith('User ('))) {
        updateDoc.name = String(custom.nickname).trim();
      }

      if (custom.last_online_time) {
        const d = new Date(custom.last_online_time);
        if (!isNaN(d.getTime())) {
          updateDoc.lastActive = d;
        }
      }

      if (Object.keys(updateDoc).length > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: rec._id },
            update: { $set: updateDoc },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await RecordModel.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, updatedCount: bulkOps.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
