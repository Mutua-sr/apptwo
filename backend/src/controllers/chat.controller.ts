import { Response, NextFunction } from 'express';
import { MangoQuery } from 'nano';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ChatMessage, CreateChatMessage } from '../types';
import { DatabaseService } from '../services/database';
import SocketService from '../services/socket.service';

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query: MangoQuery = {
      selector: {
        type: 'message',
        roomId,
        ...(before ? { timestamp: { $lt: String(before) } } : {})
      },
      limit: Number(limit),
      sort: [{ timestamp: 'desc' }]
    };

    const messages = await DatabaseService.find<ChatMessage>(query);

    res.json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      const error = new Error('Message content is required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (!req.user?.id) {
      const error = new Error('User not authenticated') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const messageData: CreateChatMessage = {
      type: 'message',
      content: content.trim(),
      roomId,
      sender: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      timestamp: new Date().toISOString()
    };

    const message = await DatabaseService.create<ChatMessage>(messageData);

    // Emit the message to all users in the room
    SocketService.getInstance().emitToRoom(roomId, 'message', message);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messageId } = req.params;

    const message = await DatabaseService.read<ChatMessage>(messageId);

    if (!message) {
      const error = new Error('Message not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (message.sender.id !== req.user?.id) {
      const error = new Error('Not authorized to delete this message') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    await DatabaseService.delete(messageId);

    // Notify users in the room that the message was deleted
    SocketService.getInstance().emitToRoom(message.roomId, 'message', {
      ...message,
      deleted: true
    });

    res.json({
      success: true,
      data: { message: 'Message deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};