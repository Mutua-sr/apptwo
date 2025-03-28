import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const createPost: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPosts: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPost: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePost: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deletePost: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createPostsForAllUsers: (res: Response, next: NextFunction) => Promise<void>;
