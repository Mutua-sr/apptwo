import { io, Socket } from 'socket.io-client';
import { ChatMessage, NewChatMessage } from '../types/chat';
import apiService from './apiService';

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');
    
    this.socket = io(API_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token
      }
    });

    this.socket.on('message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Unauthorized') {
        // Redirect to login if unauthorized
        window.location.href = '/login';
      }
    });
  }

  public joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  public leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  public async sendMessage(content: string, roomId: string, roomType: 'classroom' | 'community') {
    if (this.socket) {
      const currentUser = apiService.auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const message: NewChatMessage = {
        type: 'message',
        content,
        roomId,
        roomType,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
        },
        timestamp: new Date().toISOString()
      };
      this.socket.emit('message', message);
      
      // Also send through REST API for persistence
      await apiService.chat.sendMessage(roomId, roomType, content);
    }
  }

  public onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
  }

  public offMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

export const chatService = new ChatService();
export default chatService;