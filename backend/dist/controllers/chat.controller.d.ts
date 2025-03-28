import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getChatRooms: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createChatRoom: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChatRoom: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChatHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sendMessage: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMessage: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
