import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { ChatMessage, ChatRoom } from '../types/chat';

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

export const getChatRooms = async (
  req: ExtendedAuthRequest,
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

    // Transform rooms to match frontend expectations
    const transformedRooms = rooms.map(room => ({
      id: room._id,
      name: room.name,
      type: room.type || 'community',
      description: room.description || '',
      currentUserId: req.user?.id || '',
      participants: room.participants.map(p => ({
        id: p.userId,
        name: p.name,
        avatar: p.avatar || '',
        status: 'online',
        lastSeen: p.lastReadTimestamp
      })),
      lastMessage: room.lastMessage,
      unreadCount: 0,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }));

    res.json({
      success: true,
      data: transformedRooms
    });
  } catch (error) {
    next(error);
  }
};

export const createChatRoom = async (
  req: ExtendedAuthRequest,
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
      name: req.body.name || 'New Chat Room',
      description: req.body.description || '',
      avatar: req.body.avatar || '',
      participants: [
        {
          userId: req.user.id,
          name: req.user.name || '',
          avatar: req.user.avatar || '',
          role: 'admin' as const,
          joinedAt: timestamp
        },
        ...(req.body.participants?.map((p: any) => ({
          userId: p.userId,
          name: p.name || '',
          avatar: p.avatar || '',
          role: 'member' as const,
          joinedAt: timestamp
        })) || [])
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

    // Transform room to match frontend expectations
    const transformedRoom = {
      id: room._id,
      name: room.name,
      type: room.type || 'community',
      description: room.description || '',
      currentUserId: req.user.id,
      participants: room.participants.map(p => ({
        id: p.userId,
        name: p.name,
        avatar: p.avatar || '',
        status: 'online',
        lastSeen: p.lastReadTimestamp
      })),
      lastMessage: room.lastMessage,
      unreadCount: 0,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };

    // Notify all participants about the new room
    room.participants.forEach(participant => {
      if (participant.userId !== req.user?.id) {
        RealtimeService.getInstance().emitToUser(
          participant.userId,
          'room_created',
          { room: transformedRoom }
        );
      }
    });

    res.status(201).json({
      success: true,
      data: transformedRoom
    });
  } catch (error) {
    next(error);
  }
};

export const getChatRoom = async (
  req: ExtendedAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.roomId;
    if (!roomId) {
      throw new ApiError('Room ID is required', 400);
    }
    
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Use find with index to get the room
    const rooms = await DatabaseService.find<ChatRoom>({
      selector: {
        type: 'chatroom',
        _id: roomId
      },
      use_index: 'chatrooms-by-id-index',
      limit: 1
    });

    const room = rooms[0];
    if (!room) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Chat room not found'
        }
      });
    }

    if (!room.participants) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Invalid chat room data'
        }
      });
    }

    // Check if user is a participant
    const isParticipant = room.participants.some(p => p.userId === req.user?.id);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to access this chat room'
        }
      });
    }

    // Transform the room data to match frontend expectations
    const transformedRoom = {
      id: room._id,
      name: room.name,
      type: room.type || 'community',
      description: room.description || '',
      currentUserId: req.user.id,
      participants: room.participants.map(p => ({
        id: p.userId,
        name: p.name,
        avatar: p.avatar || '',
        status: 'online',
        lastSeen: p.lastReadTimestamp
      })),
      lastMessage: room.lastMessage,
      unreadCount: 0,
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString()
    };

    res.json({
      success: true,
      data: transformedRoom
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: ExtendedAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.roomId;
    if (!roomId) {
      throw new ApiError('Room ID is required', 400);
    }

    const { before } = req.query;
    const limit = Number(req.query.limit) || 50;

    // Check if user is a participant
    const room = await DatabaseService.read<ChatRoom>(roomId);
    if (!room || !room.participants) {
      throw new ApiError('Chat room not found', 404);
    }
    
    if (!room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Not authorized to access this chat room', 403);
    }

    const query: any = {
      selector: {
        type: 'message',
        roomId: roomId,
        ...(before ? { createdAt: { $lt: String(before) } } : {})
      },
      limit: limit,
      sort: [{ createdAt: 'desc' }] as [{ [key: string]: 'desc' | 'asc' }]
    };

    const messages = await DatabaseService.find<ChatMessage>(query);

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatar || '',
      timestamp: msg.timestamp,
      reactions: msg.reactions || {}
    }));

    res.json({
      success: true,
      data: transformedMessages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: ExtendedAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const roomId = req.params.roomId;
    if (!roomId) {
      throw new ApiError('Room ID is required', 400);
    }

    const content = req.body.content;
    if (!content) {
      throw new ApiError('Message content is required', 400);
    }

    const { replyTo, attachments } = req.body;

    // Check if user is a participant
    const room = await DatabaseService.read<ChatRoom>(roomId);
    if (!room || !room.participants) {
      throw new ApiError('Chat room not found', 404);
    }
    
    if (!room.participants.some(p => p.userId === req.user?.id)) {
      throw new ApiError('Not authorized to send messages in this room', 403);
    }

    const messageData: Omit<ChatMessage, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'message',
      content,
      roomId,
      senderId: req.user.id,
      senderName: req.user.name || '',
      senderAvatar: req.user.avatar || '',
      timestamp: new Date().toISOString(),
      ...(replyTo && { 
        replyTo: {
          messageId: replyTo,
          content: content,
          senderId: req.user.id,
          senderName: req.user.name || ''
        }
      }),
      ...(attachments && { attachments })
    };

    const message = await DatabaseService.create<ChatMessage>(messageData);

    // Transform message to match frontend expectations
    const transformedMessage = {
      id: message._id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar || '',
      timestamp: message.timestamp,
      reactions: message.reactions || {}
    };

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
      transformedMessage
    );

    res.status(201).json({
      success: true,
      data: transformedMessage
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: ExtendedAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const messageId = req.params.messageId;
    if (!messageId) {
      throw new ApiError('Message ID is required', 400);
    }

    const message = await DatabaseService.read<ChatMessage>(messageId);

    if (!message) {
      throw new ApiError('Message not found', 404);
    }

    // Check if user is the sender or an admin
    const room = await DatabaseService.read<ChatRoom>(message.roomId);
    if (!room || !room.participants) {
      throw new ApiError('Chat room not found', 404);
    }
    
    const isAdmin = room.participants.some(p => p.userId === req.user?.id && p.role === 'admin');
    if (message.senderId !== req.user?.id && !isAdmin) {
      throw new ApiError('Not authorized to delete this message', 403);
    }

    const deletedMessage = await DatabaseService.update<ChatMessage>(messageId, {
      isDeleted: true,
      deletedAt: new Date().toISOString()
    });

    // Transform deleted message to match frontend expectations
    const transformedMessage = {
      id: deletedMessage._id,
      content: deletedMessage.content,
      senderId: deletedMessage.senderId,
      senderName: deletedMessage.senderName,
      senderAvatar: deletedMessage.senderAvatar || '',
      timestamp: deletedMessage.timestamp,
      reactions: deletedMessage.reactions || {},
      isDeleted: deletedMessage.isDeleted,
      deletedAt: deletedMessage.deletedAt
    };

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
      data: transformedMessage
    });
  } catch (error) {
    next(error);
  }
};