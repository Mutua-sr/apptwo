import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
interface ExtendedAuthRequest extends AuthRequest {
    params: {
        id?: string;
        roomId?: string;
        messageId?: string;
    };
    query: {
        before?: string;
        limit?: string;
    };
    body: {
        name?: string;
        description?: string;
        avatar?: string;
        participants?: Array<{
            userId: string;
            name: string;
            avatar: string;
        }>;
        settings?: {
            isPrivate?: boolean;
            allowReactions?: boolean;
            allowAttachments?: boolean;
            allowReplies?: boolean;
            allowEditing?: boolean;
            allowDeletion?: boolean;
        };
        content?: string;
        replyTo?: string;
        attachments?: any[];
    };
}
export declare const getChatRooms: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const createChatRoom: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const getChatRoom: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const getChatHistory: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const sendMessage: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const deleteMessage: (req: ExtendedAuthRequest, res: Response, next: NextFunction) => Promise<any>;
export {};
