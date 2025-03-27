import { Response, NextFunction } from 'express';
import { VideoService } from '../services/video.service';
import { CreateVideoCallDto } from '../types/video';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const videoService = new VideoService();

export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const dto: CreateVideoCallDto = {
      caller: req.user.id,
      receiver: req.body.receiver
    };

    const session = await videoService.createSession(dto);
    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { sessionId } = req.params;
    const session = await videoService.getSession(sessionId);

    if (!session) {
      throw new ApiError('Session not found', 404);
    }

    // Check if user is part of the call
    if (session.caller !== req.user.id && session.receiver !== req.user.id) {
      throw new ApiError('Not authorized to access this session', 403);
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSessionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { sessionId } = req.params;
    const { status } = req.body;

    const session = await videoService.updateSessionStatus(sessionId, status, req.user.id);

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { sessionId } = req.params;
    const session = await videoService.endSession(sessionId, req.user.id);

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint to cleanup old sessions
export const cleanupSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Check if user is admin (you should implement proper role checking)
    if (req.user.role !== 'admin') {
      throw new ApiError('Not authorized to perform this action', 403);
    }

    await videoService.cleanupSessions();

    res.json({
      success: true,
      data: { message: 'Old sessions cleaned up successfully' }
    });
  } catch (error) {
    next(error);
  }
};