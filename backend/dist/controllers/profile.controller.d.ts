import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse, AuthUser } from '../types';
import { UserProfile, Activity, Notification, FileUploadResponse } from '../types/profile';
type HeaderFunction = (name: string) => string | undefined;
interface AuthenticatedRequest extends Omit<AuthRequest, 'header'> {
    user?: AuthUser;
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    body: any;
    header: HeaderFunction;
}
export declare const getProfile: (req: AuthenticatedRequest, res: Response<ApiResponse<UserProfile>>, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response<ApiResponse<UserProfile>>, next: NextFunction) => Promise<void>;
export declare const getActivities: (req: AuthenticatedRequest, res: Response<ApiResponse<Activity[]>>, next: NextFunction) => Promise<void>;
export declare const getNotifications: (req: AuthenticatedRequest, res: Response<ApiResponse<Notification[]>>, next: NextFunction) => Promise<void>;
export declare const markAllNotificationsRead: (req: AuthenticatedRequest, res: Response<ApiResponse<{
    message: string;
}>>, next: NextFunction) => Promise<void>;
export declare const markNotificationRead: (req: AuthenticatedRequest, res: Response<ApiResponse<Notification>>, next: NextFunction) => Promise<void>;
interface AuthenticatedMulterRequest extends Omit<AuthenticatedRequest, 'body'> {
    file?: Express.Multer.File;
    body: {
        type?: string;
        metadata?: any;
    };
}
export declare const uploadMedia: (req: AuthenticatedMulterRequest, res: Response<FileUploadResponse>, next: NextFunction) => Promise<void>;
export {};
