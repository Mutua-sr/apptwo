import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { ChatMessage } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface SocketUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ServerToClientEvents {
  message: (message: ChatMessage) => void;
}

interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  message: (message: ChatMessage) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  user: SocketUser;
}

export class SocketService {
  private static instance: SocketService;
  private io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as SocketUser;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        logger.info(`Socket ${socket.id} left room ${roomId}`);
      });

      socket.on('message', (message: ChatMessage) => {
        this.io.to(message.roomId).emit('message', {
          ...message,
          sender: {
            id: socket.data.user.id,
            name: socket.data.user.name,
            avatar: socket.data.user.avatar
          }
        });
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public static initialize(server: HttpServer): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error('Socket service not initialized');
    }
    return SocketService.instance;
  }

  public emitToRoom(roomId: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  public emitToAll(event: keyof ServerToClientEvents, data: any): void {
    this.io.emit(event, data);
  }
}

export default SocketService;