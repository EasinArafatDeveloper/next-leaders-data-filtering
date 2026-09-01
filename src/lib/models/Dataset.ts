import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDatasetDocument extends Document {
  filename: string;
  totalRecords: number;
  newRecordsCount?: number;
  updatedRecordsCount?: number;
  totalFields: number;
  fileSize: string;
  status: 'Ready' | 'Processing' | 'Failed';
  uploadedBy?: string;
  uploadedAt: Date;
}

const DatasetSchema: Schema = new Schema(
  {
    filename: { type: String, required: true },
    totalRecords: { type: Number, required: true, default: 0 },
    newRecordsCount: { type: Number, default: 0 },
    updatedRecordsCount: { type: Number, default: 0 },
    totalFields: { type: Number, required: true, default: 0 },
    fileSize: { type: String, default: '0 KB' },
    status: { type: String, enum: ['Ready', 'Processing', 'Failed'], default: 'Ready' },
    uploadedBy: { type: String, default: 'Administrator' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.Dataset) {
  delete mongoose.models.Dataset;
}

const DatasetModel: Model<IDatasetDocument> =
  mongoose.models.Dataset || mongoose.model<IDatasetDocument>('Dataset', DatasetSchema);

export default DatasetModel;
