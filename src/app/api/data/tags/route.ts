import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch distinct tags from records
    const distinctTags = await RecordModel.distinct('tags');
    const distinctCategories = await RecordModel.distinct('category');

    // Aggregate counts for tags
    const tagCounts = await RecordModel.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const countMap: Record<string, number> = {};
    tagCounts.forEach((tc) => {
      if (tc._id) countMap[tc._id] = tc.count;
    });

    const set = new Set<string>();
    distinctTags.forEach((t) => { if (t && String(t).trim()) set.add(String(t).trim()); });
    distinctCategories.forEach((c) => { if (c && String(c).trim()) set.add(String(c).trim()); });

    // Built-in presets to always include
    const defaultPresets = [
      'iPhone User',
      'WhatsApp Active',
      'Viber Contact',
      'VIP Client',
      'Corporate Lead',
    ];
    defaultPresets.forEach((p) => set.add(p));

    const tagsList = Array.from(set).map((tagName) => ({
      name: tagName,
      count: countMap[tagName] || 0,
    }));

    return NextResponse.json({ tags: tagsList });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch tags', message: error.message },
      { status: 500 }
    );
  }
}
