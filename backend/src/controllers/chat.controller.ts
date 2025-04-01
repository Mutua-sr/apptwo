import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { ChatMessage, ChatRoom } from '../types/chat';

export const getChatRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rooms = await DatabaseService.find<ChatRoom>({
      selector: {
        type: 'chatroom',
        participants: {
          $elemMatch: {
            userId: req.user?.id
          }
        }
      }
    });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

export const createChatRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const timestamp = new Date().toISOString();
    const roomData: Omit<ChatRoom, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'chatroom',
      name: req.body.name,
      description: req.body.description,
      avatar: req.body.avatar,
      participants: [
        {
          userId: req.user.id,
          name: req.user.name,
          avatar: req.user.avatar,
          role: 'admin',
          joinedAt: timestamp
        },
        ...req.body.participants.map((p: any) => ({
          userId: p.userId,
          name: p.name,
          avatar: p.avatar,
          role: 'member',
          joinedAt: timestamp
        }))
      ],
      settings: {
        isPrivate: req.body.settings?.isPrivate ?? false,
        allowReactions: req.body.settings?.allowReactions ?? true,
        allowAttachments: req.body.settings?.allowAttachments ?? true,
        allowReplies: req.body.settings?.allowReplies ?? true,
        allowEditing: req.body.settings?.allowEditing ?? true,
        allowDeletion: req.body.settings?.allowDeletion ?? true
      }
    };

    const room = await DatabaseService.create<ChatRoom>(roomData);

    // Notify all participants about the new room
    room.participants.forEach(participant => {
      if (participant.userId !== req.user?.id) {
        RealtimeService.getInstance().emitToUser(
          participant.userId,
          'room_created',
          { room }
        );
      }
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

export const getChatRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const room = await DatabaseService.read<ChatRoom>(id);

    if (!room) {
      throw new ApiError('Chat room not found', 404);
    }

    // Check if user is a participant
    if (!room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Not authorized to access this chat room', 403);
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { before, limit = 50 } = req.query;

    // Check if user is a participant
    const room = await DatabaseService.read<ChatRoom>(roomId);
    if (!room || !room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Not authorized to access this chat room', 403);
    }

    const query = {
      selector: {
        type: 'message',
        roomId,
        ...(before ? { createdAt: { $lt: String(before) } } : {})
      },
      limit: Number(limit),
      sort: [{ createdAt: 'desc' }] as [{ [key: string]: 'desc' | 'asc' }]
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
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { roomId } = req.params;
    const { content, replyTo, attachments } = req.body;

    // Check if user is a participant
    const room = await DatabaseService.read<ChatRoom>(roomId);
    if (!room || !room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Not authorized to send messages in this room', 403);
    }

    const messageData: Omit<ChatMessage, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'message',
      content,
      roomId,
      senderId: req.user.id,
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      timestamp: new Date().toISOString(),
      ...(replyTo && { replyTo }),
      ...(attachments && { attachments })
    };

    const message = await DatabaseService.create<ChatMessage>(messageData);

    // Update room's last message
    await DatabaseService.update<ChatRoom>(roomId, {
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        senderName: message.senderName,
        timestamp: message.timestamp
      }
    });

    // Broadcast message to room
    RealtimeService.getInstance().broadcastToRoom(
      roomId,
      'message',
      message
    );

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
      throw new ApiError('Message not found', 404);
    }

    // Check if user is the sender or an admin
    const room = await DatabaseService.read<ChatRoom>(message.roomId);
    const isAdmin = room?.participants.some(p => p.userId === req.user?.id && p.role === 'admin');
    if (message.senderId !== req.user?.id && !isAdmin) {
      throw new ApiError('Not authorized to delete this message', 403);
    }

    const deletedMessage = await DatabaseService.update<ChatMessage>(messageId, {
      isDeleted: true,
      deletedAt: new Date().toISOString()
    });

    // Notify room about deleted message
    RealtimeService.getInstance().broadcastToRoom(
      message.roomId,
      'message_deleted',
      {
        messageId: messageId,
        roomId: message.roomId
      }
    );

    res.json({
      success: true,
      data: deletedMessage
    });
  } catch (error) {
    next(error);
  }
};