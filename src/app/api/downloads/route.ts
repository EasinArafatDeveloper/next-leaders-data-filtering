import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import DownloadHistoryModel from '@/lib/models/DownloadHistory';

export async function GET() {
  try {
    await connectToDatabase();
    const history = await DownloadHistoryModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
