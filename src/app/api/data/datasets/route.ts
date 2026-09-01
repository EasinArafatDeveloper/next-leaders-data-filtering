import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import DatasetModel from '@/lib/models/Dataset';
import RecordModel from '@/lib/models/Record';
import ActivityLogModel from '@/lib/models/ActivityLog';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const datasets = await DatasetModel.find({}).sort({ uploadedAt: -1 }).lean();

    // Attach real-time count of records associated with each dataset
    const datasetsWithCounts = await Promise.all(
      datasets.map(async (d: any) => {
        const liveCount = await RecordModel.countDocuments({ datasetId: d._id.toString() });
        return {
          ...d,
          liveRecordsCount: liveCount > 0 ? liveCount : d.totalRecords,
        };
      })
    );

    return NextResponse.json(datasetsWithCounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 });
    }

    const dataset = await DatasetModel.findById(id);
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const session = await getSessionUser();
    const userName = session?.name || 'Administrator';

    // Delete all records belonging to this dataset
    const deleteRecordsResult = await RecordModel.deleteMany({
      $or: [{ datasetId: id }, { datasetId: dataset._id.toString() }],
    });

    const deletedCount = deleteRecordsResult.deletedCount || 0;

    // Delete the dataset entry
    await DatasetModel.findByIdAndDelete(id);

    // If no datasets remain or records were previously un-tagged, ensure state consistency
    const remainingDatasetsCount = await DatasetModel.countDocuments({});
    if (remainingDatasetsCount === 0) {
      // Clear any orphaned records if this was the only dataset
      const orphanCleanup = await RecordModel.deleteMany({});
    }

    const totalRemainingRecords = await RecordModel.countDocuments({});

    // Log Activity
    await ActivityLogModel.create({
      action: 'Dataset Deleted',
      description: `Permanently deleted dataset "${dataset.filename}" and removed ${deletedCount.toLocaleString()} associated records`,
      user: userName,
      type: 'upload',
    });

    return NextResponse.json({
      success: true,
      deletedDataset: dataset.filename,
      deletedRecordsCount: deletedCount,
      totalRemainingRecords,
      message: `File "${dataset.filename}" and ${deletedCount.toLocaleString()} associated records deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete dataset' }, { status: 500 });
  }
}
