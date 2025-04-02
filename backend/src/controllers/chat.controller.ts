import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { ChatMessage, ChatRoom } from '../types/chat';
import logger from '../config/logger';

class ChatController {
  async getChatRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const room = await DatabaseService.get<ChatRoom>(roomId);
      
      if (!room) {
        throw new Error('Chat room not found');
      }

      // Check if user has access to this room
      if (!room.members.some(member => member.id === req.user?.id)) {
        throw new Error('Access denied');
      }

      return res.json({
        success: true,
        data: room
      });
    } catch (error) {
      next(error);
    }
  }

  async getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { limit = 50, before } = req.query;

      const query = {
        selector: {
          type: 'message',
          roomId,
          ...(before && {
            timestamp: {
              $lt: before
            }
          })
        },
        sort: [{ timestamp: 'desc' }],
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

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const room = await DatabaseService.get<ChatRoom>(roomId);
      
      if (!room) {
        throw new ApiError('Chat room not found', 404);
      }

      // Check if user has access to this room
      if (!room.members.some(member => member.id === userId)) {
        throw new ApiError('Access denied', 403);
      }

      const message: ChatMessage = {
        type: 'message',
        roomId,
        content,
        sender: {
          id: userId,
          name: req.user?.name || '',
          avatar: req.user?.avatar
        },
        timestamp: new Date().toISOString(),
        reactions: {}
      };

      const savedMessage = await DatabaseService.create(message);

      // Notify room members about new message
      RealtimeService.notifyRoom(roomId, 'message', savedMessage);

      return res.json({
        success: true,
        data: savedMessage
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      next(error);
    }
  }

  async deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', 401);
      }

      const message = await DatabaseService.get<ChatMessage>(messageId);
      
      if (!message) {
        throw new ApiError('Message not found', 404);
      }

      // Check if user is the message sender
      if (message.sender.id !== userId) {
        throw new ApiError('Access denied', 403);
      }

      await DatabaseService.delete(messageId);

      // Notify room members about message deletion
      RealtimeService.notifyRoom(message.roomId, 'messageDeleted', { messageId });

      return res.json({
        success: true,
        data: { messageId }
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      next(error);
    }
  }
}

export default new ChatController();