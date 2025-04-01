import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}
interface RegisterRequest extends AuthenticatedRequest {
    body: {
        email: string;
        password: string;
        name: string;
    };
}
export declare const login: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const register: (req: RegisterRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
