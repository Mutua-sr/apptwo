import { CouchDBDocument } from './index';
export declare enum VideoCallStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    ENDED = "ENDED"
}
export interface VideoCallSession extends CouchDBDocument {
    type: 'video_call';
    caller: string;
    receiver: string;
    status: VideoCallStatus;
    roomId: string;
    iceServers?: RTCIceServer[];
    metadata?: {
        callerName?: string;
        receiverName?: string;
        duration?: number;
        quality?: string;
        endReason?: string;
    };
}
export interface CreateVideoCallDto {
    caller: string;
    receiver: string;
}
export interface UpdateVideoCallDto {
    status?: VideoCallStatus;
    metadata?: {
        duration?: number;
        quality?: string;
        endReason?: string;
    };
}
export interface VideoCallResponse {
    success: boolean;
    session?: VideoCallSession;
    error?: string;
}
export interface RTCIceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}
