import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { UserStatus, UserPresence, TypingStatus } from '../types/realtime';
import { ChatMessage } from '../types/chat';
import { SignalingData } from '../types/webrtc';
import { DatabaseService } from './database';
import logger from '../config/logger';

export class RealtimeService {
  private static instance: RealtimeService;
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private userStatuses: Map<string, UserStatus> = new Map(); // userId -> UserStatus

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  public static initialize(server: HttpServer): RealtimeService {
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
    this.io.on('connection', (socket: Socket) => {
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

      // WebRTC Signaling Events
      socket.on('signaling', (data: SignalingData) => this.handleSignaling(socket, data));

      socket.on('disconnect', () => this.handleDisconnect(socket, userId));
    });
  }

  private getUserIdFromSocket(socket: Socket): string | null {
    try {
      // Verify token and get user ID
      // This is a placeholder - implement actual JWT verification
      return 'user-id';
    } catch (error) {
      logger.error('Invalid socket authentication:', error);
      return null;
    }
  }

  private handleUserConnection(socket: Socket, userId: string): void {
    // Add socket to user's set of sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    // Update user status
    const status: UserStatus = {
      userId,
      presence: UserPresence.ONLINE,
      lastSeen: new Date().toISOString(),
      isTyping: false,
      inCall: false
    };
    this.userStatuses.set(userId, status);

    // Broadcast user's online status
    this.io.emit('user_status', status);
  }

  private async handleMessage(socket: Socket, message: ChatMessage): Promise<void> {
    try {
      // Save message to database
      const savedMessage = await DatabaseService.create(message);
      
      // Broadcast message to room
      this.io.to(message.roomId).emit('message', savedMessage);
      
      logger.info(`Message sent in room ${message.roomId}`);
    } catch (error) {
      logger.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTyping(socket: Socket, roomId: string, status: TypingStatus): void {
    const userId = this.getUserIdFromSocket(socket);
    if (!userId) return;

    const userStatus = this.userStatuses.get(userId);
    if (userStatus) {
      userStatus.isTyping = status === TypingStatus.STARTED;
      this.userStatuses.set(userId, userStatus);
    }

    socket.to(roomId).emit('typing_indicator', { userId, status });
  }

  private handleSignaling(socket: Socket, data: SignalingData): void {
    const { targetUserId } = data;
    this.emitToUser(targetUserId, 'signaling', {
      ...data,
      userId: this.getUserIdFromSocket(socket)
    });
  }

  private handleJoinRoom(socket: Socket, roomId: string): void {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);
    logger.info(`Socket ${socket.id} left room ${roomId}`);
  }

  private handleDisconnect(socket: Socket, userId: string): void {
    // Remove socket from user's set of sockets
    this.userSockets.get(userId)?.delete(socket.id);

    // If user has no more active sockets, update their status to offline
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

  public emitToUser(userId: string, event: string, data: any): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public broadcastToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  // Public methods for external use
  public getUserStatus(userId: string): UserStatus | undefined {
    return this.userStatuses.get(userId);
  }
}

export default RealtimeService;