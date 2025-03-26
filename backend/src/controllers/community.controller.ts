import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { Community, CreateCommunity, UpdateCommunity, CommunityMember } from '../types/community';
import logger from '../config/logger';

export const getCommunities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      selector: {
        type: 'community',
        ...(search && {
          $or: [
            { name: { $regex: String(search) } },
            { description: { $regex: String(search) } },
            { tags: { $elemMatch: { $regex: String(search) } } }
          ]
        })
      },
      skip,
      limit: Number(limit),
      sort: [{ createdAt: 'desc' } as { [key: string]: 'desc' | 'asc' }]
    };

    const communities = await DatabaseService.find<Community>(query);

    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

export const createCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const timestamp = new Date().toISOString();
    const communityData: Omit<Community, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'community',
      name: req.body.name,
      description: req.body.description,
      creator: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      avatar: req.body.avatar,
      banner: req.body.banner,
      members: [{
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
        role: 'admin',
        joinedAt: timestamp
      }],
      settings: {
        isPrivate: req.body.settings?.isPrivate ?? false,
        requiresApproval: req.body.settings?.requiresApproval ?? false,
        allowPosts: req.body.settings?.allowPosts ?? true,
        allowEvents: req.body.settings?.allowEvents ?? true,
        allowPolls: req.body.settings?.allowPolls ?? true
      },
      stats: {
        memberCount: 1,
        postCount: 0,
        activeMembers: 1
      },
      tags: req.body.tags || []
    };

    const community = await DatabaseService.create<Community>(communityData);

    // Notify about new community creation
    RealtimeService.getInstance().broadcastToRoom('communities', 'community_created', community);

    res.status(201).json({
      success: true,
      data: community
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
      throw new ApiError('Community not found', 404);
    }

    // Check if user can access this community
    if (community.settings.isPrivate && !community.members.some(m => m.id === req.user?.id)) {
      throw new ApiError('Not authorized to access this community', 403);
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
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // Check if user is admin
    const member = community.members.find(m => m.id === req.user?.id);
    if (!member || member.role !== 'admin') {
      throw new ApiError('Not authorized to update this community', 403);
    }

    const updateData: Partial<Community> = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.avatar && { avatar: req.body.avatar }),
      ...(req.body.banner && { banner: req.body.banner }),
      ...(req.body.settings && {
        settings: {
          isPrivate: req.body.settings.isPrivate ?? community.settings.isPrivate,
          requiresApproval: req.body.settings.requiresApproval ?? community.settings.requiresApproval,
          allowPosts: req.body.settings.allowPosts ?? community.settings.allowPosts,
          allowEvents: req.body.settings.allowEvents ?? community.settings.allowEvents,
          allowPolls: req.body.settings.allowPolls ?? community.settings.allowPolls
        }
      }),
      ...(req.body.tags && { tags: req.body.tags })
    };

    const updatedCommunity = await DatabaseService.update<Community>(id, updateData);

    // Notify members about community update
    RealtimeService.getInstance().broadcastToRoom(id, 'community_updated', updatedCommunity);

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
      throw new ApiError('Community not found', 404);
    }

    // Check if user is admin
    const member = community.members.find(m => m.id === req.user?.id);
    if (!member || member.role !== 'admin') {
      throw new ApiError('Not authorized to delete this community', 403);
    }

    await DatabaseService.delete(id);

    // Notify members about community deletion
    RealtimeService.getInstance().broadcastToRoom(id, 'community_deleted', { id });

    res.json({
      success: true,
      data: { message: 'Community deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { id } = req.params;
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // Check if user is already a member
    if (community.members.some(m => m.id === req.user?.id)) {
      throw new ApiError('Already a member of this community', 400);
    }

    const newMember: CommunityMember = {
      id: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const updatedCommunity = await DatabaseService.update<Community>(id, {
      members: [...community.members, newMember],
      stats: {
        ...community.stats,
        memberCount: community.stats.memberCount + 1
      }
    });

    // Notify members about new member
    RealtimeService.getInstance().broadcastToRoom(id, 'member_joined', {
      communityId: id,
      member: newMember
    });

    res.json({
      success: true,
      data: updatedCommunity
    });
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { id } = req.params;
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // Check if user is a member
    if (!community.members.some(m => m.id === req.user?.id)) {
      throw new ApiError('Not a member of this community', 400);
    }

    // Check if user is the only admin
    const isOnlyAdmin = 
      community.members.find(m => m.id === req.user?.id)?.role === 'admin' &&
      community.members.filter(m => m.role === 'admin').length === 1;

    if (isOnlyAdmin) {
      throw new ApiError('Cannot leave community as the only admin', 400);
    }

    const updatedCommunity = await DatabaseService.update<Community>(id, {
      members: community.members.filter(m => m.id !== req.user?.id),
      stats: {
        ...community.stats,
        memberCount: community.stats.memberCount - 1
      }
    });

    // Notify members about member leaving
    RealtimeService.getInstance().broadcastToRoom(id, 'member_left', {
      communityId: id,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: updatedCommunity
    });
  } catch (error) {
    next(error);
  }
};