import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatParticipant, ChatRoom, ChatService } from '../types/chat';
import apiService from './apiService';

class ChatServiceImpl implements ChatService {
  private socket: Socket | null = null;
  private readonly API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.API_URL, {
          withCredentials: true,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Failed to connect to chat server:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await apiService.chat.sendMessage(roomId, { content });
      if (this.socket) {
        this.socket.emit('new_message', response.data.data);
      }
      return response.data.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(roomId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
    try {
      const response = await apiService.chat.getMessages(roomId, { limit, before });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  async markAsRead(roomId: string): Promise<void> {
    try {
      await apiService.chat.markAsRead(roomId);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      const response = await apiService.chat.getParticipants(roomId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get room participants:', error);
      throw error;
    }
  }

  async addReaction(messageId: string, reaction: string): Promise<void> {
    try {
      await apiService.chat.addReaction(messageId, reaction);
      if (this.socket) {
        this.socket.emit('reaction_added', { messageId, reaction });
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    try {
      await apiService.chat.removeReaction(messageId, reaction);
      if (this.socket) {
        this.socket.emit('reaction_removed', { messageId, reaction });
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await apiService.chat.updateMessage(messageId, { content });
      if (this.socket) {
        this.socket.emit('message_updated', response.data.data);
      }
      return response.data.data;
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiService.chat.deleteMessage(messageId);
      if (this.socket) {
        this.socket.emit('message_deleted', messageId);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  async getRoom(roomId: string): Promise<ChatRoom> {
    try {
      const response = await apiService.chat.getRoom(roomId);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get room:', error);
      throw error;
    }
  }

  onMessageReceived(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  onMessageUpdated(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('message_updated', callback);
    }
  }

  onMessageDeleted(callback: (messageId: string) => void): void {
    if (this.socket) {
      this.socket.on('message_deleted', callback);
    }
  }

  onReactionAdded(callback: (data: { messageId: string; reaction: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('reaction_added', callback);
    }
  }

  onReactionRemoved(callback: (data: { messageId: string; reaction: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('reaction_removed', callback);
    }
  }

  onUserJoined(callback: (participant: ChatParticipant) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (participant: ChatParticipant) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }
}

export const chatService = new ChatServiceImpl();