import { Server, Socket } from 'socket.io';
import * as http from 'http';
import { UserStatus, UserPresence, TypingStatus } from '../types/realtime';
import { ChatMessage } from '../types/chat';
import { SignalingData } from '../types/webrtc';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types/socket';
import { DatabaseService } from './database';
import logger from '../config/logger';
import 'dotenv/config';

interface MessageTracker {
  roomId: string;
  userId: string;
  unreadCount: number;
  lastReadTimestamp: string;
}

type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export class RealtimeService {
  private static instance: RealtimeService;
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private userStatuses: Map<string, UserStatus> = new Map(); // userId -> UserStatus
  private messageTrackers: Map<string, Map<string, MessageTracker>> = new Map(); // roomId -> userId -> MessageTracker

  private constructor(server: http.Server) {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  public static initialize(server: http.Server): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService(server);
    }
    return RealtimeService.instance;
  }

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      throw new Error('RealtimeService must be initialized with a server first');
    }
    return RealtimeService.instance;
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: ServerSocket) => {
      const userId = this.getUserIdFromSocket(socket);
      if (!userId) {
        socket.disconnect();
        return;
      }

      this.handleUserConnection(socket, userId);

      // Chat Events
      socket.on('join_room', (roomId: string) => this.handleJoinRoom(socket, roomId));
      socket.on('leave_room', (roomId: string) => this.handleLeaveRoom(socket, roomId));
      socket.on('message', (message: ChatMessage) => this.handleMessage(socket, message));
      socket.on('typing_start', (roomId: string) => this.handleTyping(socket, roomId, TypingStatus.STARTED));
      socket.on('typing_stop', (roomId: string) => this.handleTyping(socket, roomId, TypingStatus.STOPPED));
      socket.on('mark_read', (data: { roomId: string }) => this.handleMarkRead(socket, data.roomId));

      // WebRTC Signaling Events
      socket.on('signaling', (data: SignalingData) => this.handleSignaling(socket, data));

      socket.on('disconnect', () => this.handleDisconnect(socket, userId));
    });
  }

  private getUserIdFromSocket(socket: ServerSocket): string | null {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        logger.warn(`No auth token provided for socket ${socket.id}`);
        return null;
      }
      return 'user-id'; // Replace with actual JWT verification
    } catch (error) {
      logger.error('Invalid socket authentication:', error);
      return null;
    }
  }

  private handleUserConnection(socket: ServerSocket, userId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    const status: UserStatus = {
      userId,
      presence: UserPresence.ONLINE,
      lastSeen: new Date().toISOString(),
      isTyping: false,
      inCall: false
    };
    this.userStatuses.set(userId, status);

    this.io.emit('user_status', status);
  }

  private async handleMessage(socket: ServerSocket, message: ChatMessage): Promise<void> {
    try {
      const savedMessage = await DatabaseService.create<ChatMessage>({
        type: 'message',
        content: message.content,
        roomId: message.roomId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        timestamp: new Date().toISOString(),
        attachments: message.attachments,
        reactions: message.reactions,
        replyTo: message.replyTo,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        isDeleted: message.isDeleted,
        deletedAt: message.deletedAt
      });

      this.io.to(message.roomId).emit('message', savedMessage);

      // Update unread counts for all users in the room except sender
      const roomUsers = await this.getRoomUsers(message.roomId);
      roomUsers.forEach(userId => {
        if (userId !== message.senderId) {
          this.incrementUnreadCount(message.roomId, userId);
        }
      });

      logger.info(`Message sent in room ${message.roomId}`);
    } catch (error) {
      logger.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async getRoomUsers(roomId: string): Promise<string[]> {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];

    const userIds = new Set<string>();
    for (const socketId of room) {
      const socket = this.io.sockets.sockets.get(socketId);
      const userId = socket ? this.getUserIdFromSocket(socket as ServerSocket) : null;
      if (userId) userIds.add(userId);
    }
    return Array.from(userIds);
  }

  private incrementUnreadCount(roomId: string, userId: string): void {
    if (!this.messageTrackers.has(roomId)) {
      this.messageTrackers.set(roomId, new Map());
    }
    const roomTrackers = this.messageTrackers.get(roomId)!;
    
    const tracker = roomTrackers.get(userId) || {
      roomId,
      userId,
      unreadCount: 0,
      lastReadTimestamp: new Date().toISOString()
    };

    tracker.unreadCount++;
    roomTrackers.set(userId, tracker);

    // Notify user about unread count update
    this.emitToUser(userId, 'unread_count_update', {
      roomId,
      unreadCount: tracker.unreadCount
    });
  }

  private handleMarkRead(socket: ServerSocket, roomId: string): void {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    const roomTrackers = this.messageTrackers.get(roomId);
    if (roomTrackers) {
      roomTrackers.set(userId, {
        roomId,
        userId,
        unreadCount: 0,
        lastReadTimestamp: new Date().toISOString()
      });

      // Notify user about reset unread count
      this.emitToUser(userId, 'unread_count_update', {
        roomId,
        unreadCount: 0
      });
    }
  }

  public async getUnreadCount(roomId: string, userId: string): Promise<number> {
    const roomTrackers = this.messageTrackers.get(roomId);
    return roomTrackers?.get(userId)?.unreadCount || 0;
  }

  private handleTyping(socket: ServerSocket, roomId: string, status: TypingStatus): void {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    const userStatus = this.userStatuses.get(userId);
    if (userStatus) {
      userStatus.isTyping = status === TypingStatus.STARTED;
      this.userStatuses.set(userId, userStatus);
    }

    socket.to(roomId).emit('typing_indicator', { userId, roomId, status });
  }

  private handleSignaling(socket: ServerSocket, data: SignalingData): void {
    const { targetUserId } = data;
    this.emitToUser(targetUserId, 'signaling', {
      ...data,
      userId: this.getUserIdFromSocket(socket)
    });
  }

  private handleJoinRoom(socket: ServerSocket, roomId: string): void {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: ServerSocket, roomId: string): void {
    socket.leave(roomId);
    logger.info(`Socket ${socket.id} left room ${roomId}`);
  }

  private handleDisconnect(socket: ServerSocket, userId: string): void {
    this.userSockets.get(userId)?.delete(socket.id);

    if (this.userSockets.get(userId)?.size === 0) {
      const status: UserStatus = {
        userId,
        presence: UserPresence.OFFLINE,
        lastSeen: new Date().toISOString(),
        isTyping: false,
        inCall: false
      };
      this.userStatuses.set(userId, status);
      this.io.emit('user_status', status);
    }
  }

  public emitToUser(userId: string, event: keyof ServerToClientEvents, data: any): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public broadcastToRoom(roomId: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  public getUserStatus(userId: string): UserStatus | undefined {
    return this.userStatuses.get(userId);
  }
}

export default RealtimeService;