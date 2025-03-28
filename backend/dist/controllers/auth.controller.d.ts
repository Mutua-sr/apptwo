import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const login: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const register: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
