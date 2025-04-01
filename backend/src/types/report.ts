import { CouchDBDocument } from './database';
import { UserRole } from './index';

export interface UserData {
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
}

export interface ActivityData {
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export type UserDocument = CouchDBDocument<UserData> & { type: 'user' };
export type ActivityDocument = CouchDBDocument<ActivityData> & { type: 'activity' };

export interface ReportDateRange {
  start: Date;
  end: Date;
}

export interface ReportOptions {
  type: 'users' | 'classrooms' | 'communities' | 'activities';
  format: 'json' | 'pdf' | 'csv';
  dateRange: ReportDateRange;
}

export interface ReportSummary {
  generatedAt: string;
  dateRange: ReportDateRange;
  type: string;
}

export interface UserReportData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    roleDistribution: Record<string, number>;
  };
  details: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
    lastActive: string;
  }>;
}

export interface ClassroomReportData {
  summary: {
    totalClassrooms: number;
    totalStudents: number;
    averageStudentsPerClass: number;
  };
  details: Array<{
    id: string;
    name: string;
    teacher: {
      id: string;
      name: string;
    };
    studentsCount: number;
    createdAt: string;
    settings: Record<string, any>;
  }>;
}

export interface CommunityReportData {
  summary: {
    totalCommunities: number;
    totalMembers: number;
    averageMembersPerCommunity: number;
  };
  details: Array<{
    id: string;
    name: string;
    creator: {
      id: string;
      name: string;
    };
    membersCount: number;
    createdAt: string;
    settings: Record<string, any>;
  }>;
}

export interface ActivityReportData {
  summary: {
    totalActivities: number;
    activityTypes: Record<string, number>;
    uniqueUsers: number;
  };
  details: Array<{
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    details: string;
  }>;
}

export type ReportData = UserReportData | ClassroomReportData | CommunityReportData | ActivityReportData;