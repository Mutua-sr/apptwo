import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getCommunities: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const joinCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const leaveCommunity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
