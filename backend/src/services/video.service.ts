import { v4 as uuidv4 } from 'uuid';
import { VideoCallSession, VideoCallStatus, CreateVideoCallDto } from '../types/video';
import { DatabaseService } from './database';
import { RealtimeService } from './realtime.service';
import logger from '../config/logger';
import { ApiError } from '../middleware/errorHandler';

export class VideoService {
  constructor() {}

  async createSession(dto: CreateVideoCallDto): Promise<VideoCallSession> {
    try {
      const session: Omit<VideoCallSession, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
        type: 'video_call',
        caller: dto.caller,
        receiver: dto.receiver,
        status: VideoCallStatus.PENDING,
        roomId: `room_${uuidv4()}`
      };

      const createdSession = await DatabaseService.create<VideoCallSession>(session);
      
      // Notify the receiver about the incoming call
      RealtimeService.getInstance().emitToUser(
        dto.receiver,
        'incoming_call',
        {
          sessionId: createdSession._id,
          caller: dto.caller,
          roomId: createdSession.roomId
        }
      );
      
      logger.info(`Video call session created: ${createdSession._id}`);
      return createdSession;
    } catch (error) {
      logger.error('Error creating video call session:', error);
      throw new ApiError('Failed to create video call session');
    }
  }

  async getSession(sessionId: string): Promise<VideoCallSession | null> {
    try {
      const session = await DatabaseService.read<VideoCallSession>(sessionId);
      return session;
    } catch (error) {
      logger.error(`Error fetching video call session ${sessionId}:`, error);
      throw new ApiError('Failed to fetch video call session');
    }
  }

  async updateSessionStatus(sessionId: string, status: VideoCallStatus, userId: string): Promise<VideoCallSession> {
    try {
      const session = await DatabaseService.read<VideoCallSession>(sessionId);
      if (!session) {
        throw new ApiError('Session not found', 404);
      }

      // Check if user is part of the call
      if (session.caller !== userId && session.receiver !== userId) {
        throw new ApiError('Not authorized to update this session', 403);
      }

      const updatedSession = await DatabaseService.update<VideoCallSession>(sessionId, { status });

      // Notify both participants about the status change
      const participants = [session.caller, session.receiver];
      participants.forEach(participantId => {
        if (participantId !== userId) {
          RealtimeService.getInstance().emitToUser(
            participantId,
            'call_status_changed',
            {
              sessionId,
              status,
              updatedBy: userId
            }
          );
        }
      });

      return updatedSession;
    } catch (error) {
      logger.error(`Error updating video call session ${sessionId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update video call session status');
    }
  }

  async endSession(sessionId: string, userId: string): Promise<VideoCallSession> {
    try {
      const session = await this.updateSessionStatus(sessionId, VideoCallStatus.ENDED, userId);

      // Notify participants that the call has ended
      const participants = [session.caller, session.receiver];
      participants.forEach(participantId => {
        if (participantId !== userId) {
          RealtimeService.getInstance().emitToUser(
            participantId,
            'call_ended',
            {
              sessionId,
              endedBy: userId
            }
          );
        }
      });

      return session;
    } catch (error) {
      logger.error(`Error ending video call session ${sessionId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to end video call session');
    }
  }

  async cleanupSessions(): Promise<void> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Find and delete old sessions
      const oldSessions = await DatabaseService.find<VideoCallSession>({
        selector: {
          type: 'video_call',
          $or: [
            { createdAt: { $lt: oneDayAgo.toISOString() } },
            { status: VideoCallStatus.ENDED }
          ]
        }
      });

      // Delete each session
      for (const session of oldSessions) {
        await DatabaseService.delete(session._id);
        logger.info(`Cleaned up video call session: ${session._id}`);
      }

      logger.info(`Cleaned up ${oldSessions.length} old video call sessions`);
    } catch (error) {
      logger.error('Error cleaning up video call sessions:', error);
      throw new ApiError('Failed to cleanup video call sessions');
    }
  }
}

export default VideoService;