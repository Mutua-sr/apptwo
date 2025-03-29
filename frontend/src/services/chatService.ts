import { io, Socket } from 'socket.io-client';
import { ChatMessage, NewChatMessage } from '../types/chat';

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.socket = io(API_URL, {
      autoConnect: false,
      withCredentials: true
    });

    this.socket.on('message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
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

  public sendMessage(content: string, roomId: string) {
    if (this.socket) {
      const message: NewChatMessage = {
        type: 'message',
        content,
        roomId,
        sender: {
          id: 'temp-id', // This should be replaced with actual user ID
          name: 'User', // This should be replaced with actual user name
        },
        timestamp: new Date().toISOString()
      };
      this.socket.emit('message', message);
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
}

export const chatService = new ChatService();
export default chatService;