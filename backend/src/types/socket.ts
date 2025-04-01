import { ChatMessage, ChatRoom } from './chat';
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
  incoming_call: (data: { callId: string; caller: any }) => void;
  call_status_changed: (data: { callId: string; status: string }) => void;
  call_ended: (data: { callId: string; reason?: string }) => void;
  new_post: (data: { post: any }) => void;
  post_updated: (data: { post: any }) => void;
  post_deleted: (data: { postId: string }) => void;
  post_liked: (data: { postId: string; userId: string }) => void;
  post_unliked: (data: { postId: string; userId: string }) => void;
  new_comment: (data: { postId: string; comment: any }) => void;
  post_shared: (data: { post: any; sharedBy: any }) => void;
  community_updated: (data: { community: any }) => void;
  join_request: (data: { communityId: string; user: any }) => void;
  member_joined: (data: { communityId: string; member: any }) => void;
  community_invite: (data: { community: any; invitedBy: any }) => void;
  room_created: (data: { room: ChatRoom }) => void;
  message_deleted: (data: { messageId: string; roomId: string }) => void;
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