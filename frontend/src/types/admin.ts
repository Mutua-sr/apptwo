export interface Report {
  _id: string;
  type: 'post' | 'comment' | 'user' | 'community';
  targetId: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  general: {
    siteName: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
  };
  content: {
    allowUserUploads: boolean;
    maxUploadSize: number;
    allowedFileTypes: string[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}