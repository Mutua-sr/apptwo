import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, Community, CreateCommunity } from '../types';

export const createCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, topics } = req.body;

    if (!name) {
      const error = new Error('Name is required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (!req.user?.id) {
      const error = new Error('User not authenticated') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const communityData: CreateCommunity = {
      type: 'community',
      name,
      description,
      topics: topics || [],
      members: [req.user.id],
      moderators: [req.user.id]
    };

    const community = await DatabaseService.create<Community>(communityData);

    res.status(201).json({
      success: true,
      data: community
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const communities = await DatabaseService.find<Community>({
      selector: {
        type: 'community'
      }
    });

    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      const error = new Error('Community not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: community
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, topics } = req.body;

    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      const error = new Error('Community not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (!community.moderators.includes(req.user?.id || '')) {
      const error = new Error('Not authorized to update this community') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    const updatedCommunity = await DatabaseService.update<Community>(id, {
      name: name || community.name,
      description: description || community.description,
      topics: topics || community.topics
    });

    res.json({
      success: true,
      data: updatedCommunity
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      const error = new Error('Community not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (!community.moderators.includes(req.user?.id || '')) {
      const error = new Error('Not authorized to delete this community') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    await DatabaseService.delete(id);

    res.json({
      success: true,
      data: { message: 'Community deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};