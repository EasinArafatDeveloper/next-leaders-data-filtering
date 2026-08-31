import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';
import DatasetModel from '@/lib/models/Dataset';

export async function GET() {
  try {
    await connectToDatabase();

    const [totalRecords, activeDataset] = await Promise.all([
      RecordModel.countDocuments({}),
      DatasetModel.findOne({}).sort({ createdAt: -1 }).lean(),
    ]);

    // Aggregate gender distribution
    const genderAggregation = await RecordModel.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    // Aggregate status distribution
    const statusAggregation = await RecordModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Aggregate top locations
    const locationAggregation = await RecordModel.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Aggregate age demographics
    const ageAggregation = await RecordModel.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 26, 36, 50, 65],
          default: '65+',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const ageRangeLabels: Record<string, string> = {
      '18': '18–25',
      '26': '26–35',
      '36': '36–49',
      '50': '50–64',
    };

    const ageFormatted = ageAggregation.map((b) => ({
      range: ageRangeLabels[String(b._id)] || '65+',
      count: b.count,
    }));

    return NextResponse.json({
      totalRecords,
      totalFields: activeDataset ? activeDataset.totalFields : 0,
      filteredRecords: totalRecords,
      lastUpload: activeDataset
        ? new Date(activeDataset.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Never',
      activeDataset: activeDataset || null,
      charts: {
        gender: genderAggregation.map((g) => ({ name: g._id || 'Other', value: g.count })),
        status: statusAggregation.map((s) => ({ name: s._id || 'Active', value: s.count })),
        locations: locationAggregation.map((l) => ({ name: l._id || 'Unknown', value: l.count })),
        ageRanges: ageFormatted,
      },
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
