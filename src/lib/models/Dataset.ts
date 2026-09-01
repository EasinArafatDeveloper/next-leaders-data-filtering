import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDatasetDocument extends Document {
  filename: string;
  totalRecords: number;
  totalRowsInFile?: number;
  newRecordsCount?: number;
  updatedRecordsCount?: number;
  unchangedRecordsCount?: number;
  skippedRowsCount?: number;
  fieldUpdatesSummary?: {
    emailUpdated?: number;
    phoneUpdated?: number;
    nameUpdated?: number;
    ageUpdated?: number;
    genderUpdated?: number;
    locationUpdated?: number;
    avatarUpdated?: number;
    activeDaysUpdated?: number;
    lastActiveUpdated?: number;
    customFieldsUpdated?: number;
  };
  auditSample?: Array<{
    rowNumber: number;
    identifier: string;
    name: string;
    status: 'new' | 'updated' | 'unchanged';
    updatedFields: string[];
    changes?: Array<{ field: string; from: string; to: string }>;
  }>;
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
    totalRowsInFile: { type: Number, default: 0 },
    newRecordsCount: { type: Number, default: 0 },
    updatedRecordsCount: { type: Number, default: 0 },
    unchangedRecordsCount: { type: Number, default: 0 },
    skippedRowsCount: { type: Number, default: 0 },
    fieldUpdatesSummary: {
      emailUpdated: { type: Number, default: 0 },
      phoneUpdated: { type: Number, default: 0 },
      nameUpdated: { type: Number, default: 0 },
      ageUpdated: { type: Number, default: 0 },
      genderUpdated: { type: Number, default: 0 },
      locationUpdated: { type: Number, default: 0 },
      avatarUpdated: { type: Number, default: 0 },
      activeDaysUpdated: { type: Number, default: 0 },
      lastActiveUpdated: { type: Number, default: 0 },
      customFieldsUpdated: { type: Number, default: 0 },
    },
    auditSample: [
      {
        rowNumber: Number,
        identifier: String,
        name: String,
        status: { type: String, enum: ['new', 'updated', 'unchanged'] },
        updatedFields: [String],
        changes: [
          {
            field: String,
            from: String,
            to: String,
          },
        ],
      },
    ],
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
