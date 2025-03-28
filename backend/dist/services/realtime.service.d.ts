import { Server as HttpServer } from 'http';
import { UserStatus } from '../types/realtime';
export declare class RealtimeService {
    private static instance;
    private io;
    private userSockets;
    private userStatuses;
    private constructor();
    static initialize(server: HttpServer): RealtimeService;
    static getInstance(): RealtimeService;
    private setupSocketHandlers;
    private getUserIdFromSocket;
    private handleUserConnection;
    private handleMessage;
    private handleTyping;
    private handleSignaling;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handleDisconnect;
    emitToUser(userId: string, event: string, data: any): void;
    broadcastToRoom(roomId: string, event: string, data: any): void;
    getUserStatus(userId: string): UserStatus | undefined;
}
export default RealtimeService;
