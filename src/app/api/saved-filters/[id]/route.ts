import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SavedFilterModel from '@/lib/models/SavedFilter';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    await SavedFilterModel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
