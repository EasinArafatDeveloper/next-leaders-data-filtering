import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SavedFilterModel from '@/lib/models/SavedFilter';
import ActivityLogModel from '@/lib/models/ActivityLog';

export async function GET() {
  try {
    await connectToDatabase();
    const savedFilters = await SavedFilterModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(savedFilters);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, filters } = body;

    if (!name || !filters) {
      return NextResponse.json({ error: 'Name and filters required' }, { status: 400 });
    }

    const newFilter = await SavedFilterModel.create({ name, filters });

    await ActivityLogModel.create({
      action: 'Filter Saved',
      description: `Saved preset filter combination: "${name}"`,
      user: 'Easin Arafat',
      type: 'filter',
    });

    return NextResponse.json(newFilter, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
