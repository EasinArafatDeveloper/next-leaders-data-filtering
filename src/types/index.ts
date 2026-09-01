export interface IRecord {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  area: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  lastActive: string | Date;
  activeDays: number;
  avatarType?: 'With Avatar' | 'Without Avatar' | 'Custom' | 'Initial' | string;
  avatarUrl?: string;
  customFields?: Record<string, any>;
  datasetId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDatasetSummary {
  _id?: string;
  filename: string;
  totalRecords: number;
  newRecordsCount?: number;
  updatedRecordsCount?: number;
  totalFields: number;
  fileSize: string;
  status: 'Ready' | 'Processing' | 'Failed';
  uploadedBy?: string;
  uploadedAt: string | Date;
}

export interface ISavedFilter {
  _id?: string;
  name: string;
  filters: FilterQueryState;
  createdAt: string | Date;
}

export interface IDownloadHistory {
  _id?: string;
  filename: string;
  recordCount: number;
  filtersApplied: string;
  createdAt: string | Date;
  status: 'Ready' | 'Expired';
}

export interface IUser {
  _id?: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'viewer';
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  lastLoginAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserSession {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface IActivityLog {
  _id?: string;
  action: string;
  description: string;
  user: string;
  type: 'upload' | 'export' | 'filter' | 'system' | 'auth';
  createdAt: string | Date;
}

export interface FilterQueryState {
  search?: string;
  datasetId?: string;
  filename?: string;
  gender?: string;
  minAge?: number | string;
  maxAge?: number | string;
  avatarType?: string;
  numberStartsWith?: string;
  maxActiveDays?: number | string;
  lastOnlineFrom?: string;
  lastOnlineTo?: string;
  status?: string;
  location?: string;
  // Search-wise target checkboxes
  nameWise?: boolean;
  numberWise?: boolean;
  genderWise?: boolean;
  ageWise?: boolean;
  lastOnlineWise?: boolean;
  avatarTypeWise?: boolean;
  // View and pagination
  viewMode?: 'cards' | 'table';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summaryStats?: {
    totalRecords: number;
    filteredRecords: number;
    activeCount: number;
    inactiveCount: number;
    pendingCount: number;
    avgAge: number;
  };
}
