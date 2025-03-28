"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const uuid_1 = require("uuid");
const video_1 = require("../types/video");
const database_1 = require("./database");
const realtime_service_1 = require("./realtime.service");
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
class VideoService {
    constructor() { }
    async createSession(dto) {
        try {
            const session = {
                type: 'video_call',
                caller: dto.caller,
                receiver: dto.receiver,
                status: video_1.VideoCallStatus.PENDING,
                roomId: `room_${(0, uuid_1.v4)()}`
            };
            const createdSession = await database_1.DatabaseService.create(session);
            // Notify the receiver about the incoming call
            realtime_service_1.RealtimeService.getInstance().emitToUser(dto.receiver, 'incoming_call', {
                sessionId: createdSession._id,
                caller: dto.caller,
                roomId: createdSession.roomId
            });
            logger_1.default.info(`Video call session created: ${createdSession._id}`);
            return createdSession;
        }
        catch (error) {
            logger_1.default.error('Error creating video call session:', error);
            throw new errorHandler_1.ApiError('Failed to create video call session');
        }
    }
    async getSession(sessionId) {
        try {
            const session = await database_1.DatabaseService.read(sessionId);
            return session;
        }
        catch (error) {
            logger_1.default.error(`Error fetching video call session ${sessionId}:`, error);
            throw new errorHandler_1.ApiError('Failed to fetch video call session');
        }
    }
    async updateSessionStatus(sessionId, status, userId) {
        try {
            const session = await database_1.DatabaseService.read(sessionId);
            if (!session) {
                throw new errorHandler_1.ApiError('Session not found', 404);
            }
            // Check if user is part of the call
            if (session.caller !== userId && session.receiver !== userId) {
                throw new errorHandler_1.ApiError('Not authorized to update this session', 403);
            }
            const updatedSession = await database_1.DatabaseService.update(sessionId, { status });
            // Notify both participants about the status change
            const participants = [session.caller, session.receiver];
            participants.forEach(participantId => {
                if (participantId !== userId) {
                    realtime_service_1.RealtimeService.getInstance().emitToUser(participantId, 'call_status_changed', {
                        sessionId,
                        status,
                        updatedBy: userId
                    });
                }
            });
            return updatedSession;
        }
        catch (error) {
            logger_1.default.error(`Error updating video call session ${sessionId}:`, error);
            if (error instanceof errorHandler_1.ApiError) {
                throw error;
            }
            throw new errorHandler_1.ApiError('Failed to update video call session status');
        }
    }
    async endSession(sessionId, userId) {
        try {
            const session = await this.updateSessionStatus(sessionId, video_1.VideoCallStatus.ENDED, userId);
            // Notify participants that the call has ended
            const participants = [session.caller, session.receiver];
            participants.forEach(participantId => {
                if (participantId !== userId) {
                    realtime_service_1.RealtimeService.getInstance().emitToUser(participantId, 'call_ended', {
                        sessionId,
                        endedBy: userId
                    });
                }
            });
            return session;
        }
        catch (error) {
            logger_1.default.error(`Error ending video call session ${sessionId}:`, error);
            if (error instanceof errorHandler_1.ApiError) {
                throw error;
            }
            throw new errorHandler_1.ApiError('Failed to end video call session');
        }
    }
    async cleanupSessions() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            // Find and delete old sessions
            const oldSessions = await database_1.DatabaseService.find({
                selector: {
                    type: 'video_call',
                    $or: [
                        { createdAt: { $lt: oneDayAgo.toISOString() } },
                        { status: video_1.VideoCallStatus.ENDED }
                    ]
                }
            });
            // Delete each session
            for (const session of oldSessions) {
                await database_1.DatabaseService.delete(session._id);
                logger_1.default.info(`Cleaned up video call session: ${session._id}`);
            }
            logger_1.default.info(`Cleaned up ${oldSessions.length} old video call sessions`);
        }
        catch (error) {
            logger_1.default.error('Error cleaning up video call sessions:', error);
            throw new errorHandler_1.ApiError('Failed to cleanup video call sessions');
        }
    }
}
exports.VideoService = VideoService;
exports.default = VideoService;
//# sourceMappingURL=video.service.js.map