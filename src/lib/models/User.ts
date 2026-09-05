import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITwoFactorDevice {
  id: string;
  name: string;
  deviceType: 'iphone' | 'android' | 'desktop' | 'phone';
  addedAt: Date;
  status: 'active' | 'revoked';
}

export interface IUserDocument extends Document {
  username: string;
  password: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'viewer';
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  twoFactorTempSecret?: string | null;
  twoFactorBackupCodes?: string[];
  twoFactorCreatedAt?: Date | null;
  twoFactorDevices?: ITwoFactorDevice[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Administrator',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'admin@dataflow.io',
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'viewer'],
      default: 'admin',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorTempSecret: {
      type: String,
      default: null,
    },
    twoFactorBackupCodes: {
      type: [String],
      default: [],
    },
    twoFactorCreatedAt: {
      type: Date,
      default: null,
    },
    twoFactorDevices: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          deviceType: { type: String, default: 'phone' },
          addedAt: { type: Date, default: Date.now },
          status: { type: String, default: 'active' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
