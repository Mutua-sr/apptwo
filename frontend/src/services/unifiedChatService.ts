import { io, Socket } from 'socket.io-client';
import { API_URL } from './apiService';
import { 
  UnifiedChatMessage, 
  UnifiedChatRoom, 
  UnifiedChatParticipant,
  UnifiedChatService 
} from '../types/unifiedChat';

class UnifiedChatServiceImpl implements UnifiedChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: UnifiedChatMessage) => void)[] = [];
  private userJoinedCallbacks: ((participant: UnifiedChatParticipant) => void)[] = [];
  private userLeftCallbacks: ((participant: UnifiedChatParticipant) => void)[] = [];
  private typingStartCallbacks: ((data: { roomId: string; userId: string }) => void)[] = [];
  private typingEndCallbacks: ((data: { roomId: string; userId: string }) => void)[] = [];

  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    return new Promise((resolve, reject) => {
      this.socket = io(API_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.setupEventListeners();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('join_room', roomId, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomId);
    }
  }

  async sendMessage(roomId: string, content: string): Promise<UnifiedChatMessage> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('send_message', { roomId, content }, (response: { message?: UnifiedChatMessage, error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.message) {
          resolve(response.message);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }

  async getMessages(roomId: string, limit = 50, before?: string): Promise<UnifiedChatMessage[]> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_messages', { roomId, limit, before }, (response: { messages?: UnifiedChatMessage[], error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.messages) {
          resolve(response.messages);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }

  async getRooms(type: 'community' | 'classroom'): Promise<UnifiedChatRoom[]> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_rooms', { type }, (response: { rooms?: UnifiedChatRoom[], error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.rooms) {
          resolve(response.rooms);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }

  async getRoom(roomId: string): Promise<UnifiedChatRoom> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_room', { roomId }, (response: { room?: UnifiedChatRoom, error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.room) {
          resolve(response.room);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }

  async getRoomParticipants(roomId: string): Promise<UnifiedChatParticipant[]> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('get_participants', { roomId }, (response: { participants?: UnifiedChatParticipant[], error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else if (response.participants) {
          resolve(response.participants);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }

  async markAsRead(roomId: string, messageId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('mark_as_read', { roomId, messageId }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  async addReaction(messageId: string, reaction: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('add_reaction', { messageId, reaction }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('remove_reaction', { messageId, reaction }, (response: { error?: string }) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  onMessageReceived(callback: (message: UnifiedChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onUserJoined(callback: (participant: UnifiedChatParticipant) => void): void {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeft(callback: (participant: UnifiedChatParticipant) => void): void {
    this.userLeftCallbacks.push(callback);
  }

  onTypingStart(callback: (data: { roomId: string; userId: string }) => void): void {
    this.typingStartCallbacks.push(callback);
  }

  onTypingEnd(callback: (data: { roomId: string; userId: string }) => void): void {
    this.typingEndCallbacks.push(callback);
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('message', (message: UnifiedChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('user_joined', (participant: UnifiedChatParticipant) => {
      this.userJoinedCallbacks.forEach(callback => callback(participant));
    });

    this.socket.on('user_left', (participant: UnifiedChatParticipant) => {
      this.userLeftCallbacks.forEach(callback => callback(participant));
    });

    this.socket.on('typing_start', (data: { roomId: string; userId: string }) => {
      this.typingStartCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('typing_end', (data: { roomId: string; userId: string }) => {
      this.typingEndCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected to chat server after', attemptNumber, 'attempts');
    });
  }
}

export const unifiedChatService = new UnifiedChatServiceImpl();