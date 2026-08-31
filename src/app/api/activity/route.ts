import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ActivityLogModel from '@/lib/models/ActivityLog';

export async function GET() {
  try {
    await connectToDatabase();
    const activities = await ActivityLogModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
