import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
interface AuthenticatedRequest extends Request {
    body: {
        email: string;
        password: string;
    };
    user?: {
        id: string;
        profileId: string;
        email: string;
        name: string;
        role: UserRole;
    };
}
interface RegisterRequest extends AuthenticatedRequest {
    body: {
        email: string;
        password: string;
        name: string;
        role?: UserRole;
    };
}
export declare const getMe: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const register: (req: RegisterRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
