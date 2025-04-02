import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { ChatMessage, ChatRoom } from '../types/chat';
import logger from '../config/logger';

export async function getChatRoom(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { roomId } = req.params;
    const room = await DatabaseService.read<ChatRoom>(roomId);
    
    if (!room) {
      throw new ApiError('Chat room not found', 404);
    }

    // Check if user has access to this room
    if (!room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Access denied', 403);
    }

    return res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
}

export async function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query = {
      selector: {
        type: 'message',
        roomId,
        ...(before && {
          timestamp: {
            $lt: before.toString()
          }
        })
      },
      sort: [{ timestamp: 'desc' }] as [{ [key: string]: 'asc' | 'desc' }],
      limit: Number(limit)
    };

    const messages = await DatabaseService.find<ChatMessage>(query);

    return res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name;

    if (!userId || !userName) {
      throw new ApiError('User not authenticated', 401);
    }

    const room = await DatabaseService.read<ChatRoom>(roomId);
    
    if (!room) {
      throw new ApiError('Chat room not found', 404);
    }

    // Check if user has access to this room
    if (!room.participants.some(p => p.userId === userId)) {
      throw new ApiError('Access denied', 403);
    }

    const message: Omit<ChatMessage, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'message',
      roomId,
      content,
      senderId: userId,
      senderName: userName,
      senderAvatar: req.user?.avatar,
      timestamp: new Date().toISOString(),
      reactions: {},
      isEdited: false,
      isDeleted: false
    };

    const savedMessage = await DatabaseService.create<ChatMessage>(message);

    // Update room's last message
    await DatabaseService.update<ChatRoom>(roomId, {
      lastMessage: {
        content: savedMessage.content,
        senderId: savedMessage.senderId,
        senderName: savedMessage.senderName,
        timestamp: savedMessage.timestamp
      }
    });

    // Notify room members about new message
    RealtimeService.getInstance().broadcastToRoom(roomId, 'message', savedMessage);

    return res.json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    next(error);
  }
}

export async function deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const message = await DatabaseService.read<ChatMessage>(messageId);
    
    if (!message) {
      throw new ApiError('Message not found', 404);
    }

    // Check if user is the message sender
    if (message.senderId !== userId) {
      throw new ApiError('Access denied', 403);
    }

    await DatabaseService.update<ChatMessage>(messageId, {
      isDeleted: true,
      deletedAt: new Date().toISOString()
    });

    // Notify room members about message deletion
    RealtimeService.getInstance().broadcastToRoom(message.roomId, 'message_deleted', { 
      messageId,
      roomId: message.roomId 
    });

    return res.json({
      success: true,
      data: { messageId }
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    next(error);
  }
}