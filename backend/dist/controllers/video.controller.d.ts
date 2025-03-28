import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const createSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSessionStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const endSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cleanupSessions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
