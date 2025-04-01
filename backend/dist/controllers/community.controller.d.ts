import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { Community, CommunityInvite } from '../types/community';
type AuthenticatedRequest = Request & AuthRequest;
export declare const createCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<Community>>, next: NextFunction) => Promise<void>;
export declare const getCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<Community>>, next: NextFunction) => Promise<void>;
export declare const updateCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<Community>>, next: NextFunction) => Promise<void>;
export declare const joinCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<Community>>, next: NextFunction) => Promise<void>;
export declare const getCommunities: (req: AuthenticatedRequest, res: Response<ApiResponse<Community[]>>, next: NextFunction) => Promise<void>;
export declare const deleteCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<{
    message: string;
}>>, next: NextFunction) => Promise<void>;
export declare const leaveCommunity: (req: AuthenticatedRequest, res: Response<ApiResponse<Community>>, next: NextFunction) => Promise<void>;
export declare const inviteMember: (req: AuthenticatedRequest, res: Response<ApiResponse<CommunityInvite>>, next: NextFunction) => Promise<void>;
export {};
