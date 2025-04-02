import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare function getChatRoom(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void>;
export declare function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void>;
export declare function sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void>;
export declare function deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void>;
