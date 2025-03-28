import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';
import { 
  Community,
  CommunityMember,
  CommunityInvite,
  JoinRequest
} from '../types/community';
import logger from '../config/logger';

type AuthenticatedRequest = Request & AuthRequest;

export const createCommunity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community>>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Validate required fields
    if (!req.body.name?.trim()) {
      throw new ApiError('Name is required', 400);
    }
    if (!req.body.description?.trim()) {
      throw new ApiError('Description is required', 400);
    }

    const communityData: Omit<Community, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'community',
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      avatar: req.body.avatar,
      banner: req.body.banner,
      creator: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      members: [{
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
        role: 'admin',
        joinedAt: new Date().toISOString()
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

    logger.info(`Community created: ${community._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: community
    });
  } catch (error) {
    logger.error('Error creating community:', error);
    next(error);
  }
};

export const getCommunity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // If community is private, check if user is a member
    if (community.settings.isPrivate && 
        !community.members.some(member => member.id === req.user?.id)) {
      throw new ApiError('Not authorized to view this community', 403);
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
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community>>,
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
      ...(req.body.name && { name: req.body.name.trim() }),
      ...(req.body.description && { description: req.body.description.trim() }),
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

export const joinCommunity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // Check if user is already a member
    if (community.members.some(member => member.id === req.user?.id)) {
      throw new ApiError('Already a member of this community', 400);
    }

    // If community requires approval, create join request
    if (community.settings.requiresApproval) {
      const now = new Date().toISOString();
      const joinRequest: Omit<JoinRequest, '_id' | '_rev'> = {
        type: 'join_request',
        communityId: id,
        userId: req.user!.id,
        message: req.body.message,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };

      // Store join request in database
      await DatabaseService.create({
        ...joinRequest,
        type: 'join_request'
      });

      // Notify admins about join request
      const admins = community.members.filter(m => m.role === 'admin');
      admins.forEach(admin => {
        RealtimeService.getInstance().emitToUser(admin.id, 'join_request', joinRequest);
      });

    res.json({
      success: true,
      data: community
    });
      return;
    }

    // Add member directly if no approval required
    const newMember: CommunityMember = {
      id: req.user!.id,
      name: req.user!.name,
      avatar: req.user?.avatar,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const updatedCommunity = await DatabaseService.update<Community>(id, {
      members: [...community.members, newMember],
      stats: {
        ...community.stats,
        memberCount: community.stats.memberCount + 1,
        activeMembers: community.stats.activeMembers + 1
      }
    });

    // Notify about new member
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

export const getCommunities = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community[]>>,
  next: NextFunction
) => {
  try {
    const { filter = 'all' } = req.query;
    let query: any = {
      selector: {
        type: 'community'
      }
    };

    // Filter communities based on user's membership
    if (filter === 'member') {
      query.selector.members = {
        $elemMatch: {
          id: req.user?.id
        }
      };
    } else if (filter === 'admin') {
      query.selector.members = {
        $elemMatch: {
          id: req.user?.id,
          role: 'admin'
        }
      };
    } else {
      // For 'all', only include public communities and ones user is member of
      query = {
        selector: {
          type: 'community',
          $or: [
            { 'settings.isPrivate': false },
            {
              members: {
                $elemMatch: {
                  id: req.user?.id
                }
              }
            }
          ]
        }
      };
    }

    const communities = await DatabaseService.find<Community>(query);

    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommunity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ message: string }>>,
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

    res.json({
      success: true,
      data: { message: 'Community deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Community>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    const memberIndex = community.members.findIndex(m => m.id === req.user?.id);
    if (memberIndex === -1) {
      throw new ApiError('Not a member of this community', 400);
    }

    // Check if user is the only admin
    if (community.members[memberIndex].role === 'admin' &&
        community.members.filter(m => m.role === 'admin').length === 1) {
      throw new ApiError('Cannot leave community as the only admin. Transfer ownership first.', 400);
    }

    const updatedMembers = [...community.members];
    updatedMembers.splice(memberIndex, 1);

    const updatedCommunity = await DatabaseService.update<Community>(id, {
      members: updatedMembers,
      stats: {
        ...community.stats,
        memberCount: community.stats.memberCount - 1,
        activeMembers: community.stats.activeMembers - 1
      }
    });

    res.json({
      success: true,
      data: updatedCommunity
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<CommunityInvite>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const community = await DatabaseService.read<Community>(id);

    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    // Check if user has permission to invite
    const member = community.members.find(m => m.id === req.user?.id);
    if (!member || !['admin', 'moderator'].includes(member.role)) {
      throw new ApiError('Not authorized to invite members', 403);
    }

    // Create invite
    const now = new Date().toISOString();
    const invite: Omit<CommunityInvite, '_id' | '_rev'> = {
      type: 'invite',
      communityId: id,
      inviterId: req.user!.id,
      inviteeId: userId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    const createdInvite = await DatabaseService.create<CommunityInvite>(invite);

    // Notify invitee
    RealtimeService.getInstance().emitToUser(userId, 'community_invite', {
      invite: createdInvite,
      community: {
        id: community._id,
        name: community.name,
        description: community.description,
        avatar: community.avatar
      }
    });

    res.json({
      success: true,
      data: createdInvite
    });
  } catch (error) {
    next(error);
  }
};