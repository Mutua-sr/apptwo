import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Request } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadMedia: (req: MulterRequest & AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getActivities: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getNotifications: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markNotificationRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAllNotificationsRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
