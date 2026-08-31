import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import RecordModel from '@/lib/models/Record';
import DatasetModel from '@/lib/models/Dataset';

export const dynamic = 'force-dynamic';

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
      '36': '36–50',
      '50': '50–65',
      '65+': '65+',
    };

    const formattedAgeData = ageAggregation.map((item) => ({
      range: ageRangeLabels[String(item._id)] || String(item._id),
      count: item.count,
    }));

    return NextResponse.json({
      totalRecords,
      dataset: activeDataset || null,
      genderDistribution: genderAggregation.map((g) => ({
        name: g._id || 'Unknown',
        value: g.count,
      })),
      statusDistribution: statusAggregation.map((s) => ({
        name: s._id || 'Unknown',
        value: s.count,
      })),
      topLocations: locationAggregation.map((l) => ({
        location: l._id || 'Unspecified',
        count: l.count,
      })),
      ageDemographics: formattedAgeData,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset statistics', message: error.message },
      { status: 500 }
    );
  }
}
