import { ChatMessage } from './chat';
import { SignalingData } from './webrtc';
import { UserStatus, TypingIndicator } from './realtime';

export interface ServerToClientEvents {
  message: (message: ChatMessage) => void;
  user_status: (status: UserStatus) => void;
  typing_indicator: (data: TypingIndicator) => void;
  unread_count_update: (data: { roomId: string; unreadCount: number }) => void;
  signaling: (data: SignalingData) => void;
  error: (data: { message: string }) => void;
  student_joined: (data: { classroomId: string; student: any }) => void;
  classroom_updated: (data: any) => void;
  new_assignment: (data: { classroomId: string; assignment: any }) => void;
  new_material: (data: { classroomId: string; material: any }) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  message: (message: ChatMessage) => void;
  typing_start: (roomId: string) => void;
  typing_stop: (roomId: string) => void;
  mark_read: (data: { roomId: string }) => void;
  signaling: (data: SignalingData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  auth: {
    token: string;
  };
}