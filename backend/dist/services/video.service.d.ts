import { VideoCallSession, VideoCallStatus, CreateVideoCallDto } from '../types/video';
export declare class VideoService {
    constructor();
    createSession(dto: CreateVideoCallDto): Promise<VideoCallSession>;
    getSession(sessionId: string): Promise<VideoCallSession | null>;
    updateSessionStatus(sessionId: string, status: VideoCallStatus, userId: string): Promise<VideoCallSession>;
    endSession(sessionId: string, userId: string): Promise<VideoCallSession>;
    cleanupSessions(): Promise<void>;
}
export default VideoService;
