import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const auth: (req: AuthRequest, _: Response, next: NextFunction) => Promise<void>;
