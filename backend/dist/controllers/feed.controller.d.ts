import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { Post } from '../types/feed';
type AuthenticatedRequest = Request & AuthRequest;
export declare const getPosts: (req: AuthenticatedRequest, res: Response<ApiResponse<Post[]>>, next: NextFunction) => Promise<void>;
export declare const getPost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const createPost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const updatePost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const deletePost: (req: AuthenticatedRequest, res: Response<ApiResponse<{
    message: string;
}>>, next: NextFunction) => Promise<void>;
export declare const likePost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const unlikePost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const addComment: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export declare const sharePost: (req: AuthenticatedRequest, res: Response<ApiResponse<Post>>, next: NextFunction) => Promise<void>;
export {};
