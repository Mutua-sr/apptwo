import { Server as HttpServer } from 'http';
import { ChatMessage } from '../types';
interface ServerToClientEvents {
    message: (message: ChatMessage) => void;
}
export declare class SocketService {
    private static instance;
    private io;
    private constructor();
    static initialize(server: HttpServer): SocketService;
    static getInstance(): SocketService;
    emitToRoom(roomId: string, event: keyof ServerToClientEvents, data: any): void;
    emitToAll(event: keyof ServerToClientEvents, data: any): void;
}
export default SocketService;
