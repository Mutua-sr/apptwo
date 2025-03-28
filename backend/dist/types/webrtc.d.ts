export interface WebRTCIceCandidate {
    candidate: string;
    sdpMLineIndex: number | null;
    sdpMid: string | null;
    usernameFragment: string | null;
}
export interface WebRTCSessionDescription {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp: string;
}
export interface CallRequest {
    callerId: string;
    targetUserId: string;
    roomId: string;
}
export interface CallResponse {
    userId: string;
    roomId: string;
    accepted: boolean;
    reason?: string;
}
export interface SignalingData {
    userId: string;
    targetUserId: string;
    type: 'offer' | 'answer' | 'candidate';
    payload: WebRTCSessionDescription | WebRTCIceCandidate;
}
