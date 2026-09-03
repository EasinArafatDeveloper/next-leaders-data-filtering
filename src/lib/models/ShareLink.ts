import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShareLinkDocument extends Document {
  token: string;
  title: string;
  filterSummary: string;
  recordCount: number;
  recordsSnapshot: Array<{
    name: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
    location?: string;
    area?: string;
    avatarUrl?: string;
    avatarType?: string;
    status?: string;
    activeDays?: number;
    tags?: string[];
    category?: string;
    customFields?: Record<string, any>;
  }>;
  maxViews: number;
  viewCount: number;
  isBurned: boolean;
  expiresAt: Date;
  passcodeHash?: string;
  hasPasscode: boolean;
  createdBy: string;
  accessLogs: Array<{
    ip?: string;
    userAgent?: string;
    accessedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ShareLinkSchema: Schema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'Shared Filtered Contacts' },
    filterSummary: { type: String, default: 'Filtered Snapshot' },
    recordCount: { type: Number, required: true, default: 0 },
    recordsSnapshot: { type: [Schema.Types.Mixed], default: [] },
    maxViews: { type: Number, default: 1 },
    viewCount: { type: Number, default: 0 },
    isBurned: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true },
    passcodeHash: { type: String, default: '' },
    hasPasscode: { type: Boolean, default: false },
    createdBy: { type: String, default: 'Administrator' },
    accessLogs: [
      {
        ip: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        accessedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove very old expired links after 30 days
ShareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

// In development, ensure new schema definitions reload properly
if (process.env.NODE_ENV !== 'production' && mongoose.models.ShareLink) {
  delete mongoose.models.ShareLink;
}

const ShareLinkModel: Model<IShareLinkDocument> =
  mongoose.models.ShareLink || mongoose.model<IShareLinkDocument>('ShareLink', ShareLinkSchema);

export default ShareLinkModel;
