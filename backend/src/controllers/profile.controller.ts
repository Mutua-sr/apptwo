import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';
import { 
  UserProfile, 
  Activity, 
  Notification, 
  MediaUpload,
  FileUploadRequest,
  FileUploadResponse 
} from '../types/profile';
import logger from '../config/logger';

type AuthenticatedRequest = Request & AuthRequest;

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfile>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const profile = await DatabaseService.read<UserProfile>(id);

    if (!profile) {
      throw new ApiError('Profile not found', 404);
    }

    // Create a sanitized copy of the profile based on privacy settings
    const sanitizedProfile = { ...profile };
    if (profile.userId !== req.user?.id) {
      if (!profile.settings.privacy.showEmail) {
        sanitizedProfile.email = '';
      }
      if (!profile.settings.privacy.showActivity) {
        sanitizedProfile.stats = {
          posts: 0,
          communities: 0,
          classrooms: 0,
          lastActive: ''
        };
      }
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfile>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const profile = await DatabaseService.read<UserProfile>(id);

    if (!profile) {
      throw new ApiError('Profile not found', 404);
    }

    // Only allow users to update their own profile
    if (profile.userId !== req.user?.id) {
      throw new ApiError('Not authorized to update this profile', 403);
    }

    const updateData: Partial<UserProfile> = {
      ...(req.body.username && { username: req.body.username.trim() }),
      ...(req.body.name && { name: req.body.name.trim() }),
      ...(req.body.avatar && { avatar: req.body.avatar }),
      ...(req.body.bio && { bio: req.body.bio.trim() }),
      ...(req.body.settings && {
        settings: {
          ...profile.settings,
          ...req.body.settings,
          notifications: {
            ...profile.settings.notifications,
            ...req.body.settings.notifications
          },
          privacy: {
            ...profile.settings.privacy,
            ...req.body.settings.privacy
          }
        }
      }),
      ...(req.body.social && {
        social: {
          ...profile.social,
          ...req.body.social
        }
      }),
      ...(req.body.education && { education: req.body.education }),
      ...(req.body.skills && { skills: req.body.skills }),
      ...(req.body.interests && { interests: req.body.interests })
    };

    const updatedProfile = await DatabaseService.update<UserProfile>(id, updateData);

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    logger.info(`Profile updated: ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    next(error);
  }
};

export const getActivities = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Activity[]>>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const activities = await DatabaseService.find<Activity>({
      selector: {
        type: 'activity',
        userId
      },
      sort: [{ timestamp: 'desc' }],
      skip,
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Notification[]>>,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const notifications = await DatabaseService.find<Notification>({
      selector: {
        type: 'notification',
        userId: req.user.id,
        ...(unreadOnly && { read: false })
      },
      sort: [{ createdAt: 'desc' }],
      skip,
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ message: string }>>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Find all unread notifications for the user
    const notifications = await DatabaseService.find<Notification>({
      selector: {
        type: 'notification',
        userId: req.user.id,
        read: false
      }
    });

    // Update all notifications to read
    const now = new Date().toISOString();
    await Promise.all(
      notifications.map(notification =>
        DatabaseService.update<Notification>(notification._id, {
          read: true,
          readAt: now
        })
      )
    );

    res.json({
      success: true,
      data: { message: 'All notifications marked as read' }
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Notification>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const notification = await DatabaseService.read<Notification>(id);

    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    if (notification.userId !== req.user?.id) {
      throw new ApiError('Not authorized to update this notification', 403);
    }

    const updatedNotification = await DatabaseService.update<Notification>(id, {
      read: true,
      readAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMedia = async (
  req: AuthenticatedRequest,
  res: Response<FileUploadResponse>,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }

    const uploadRequest: FileUploadRequest = {
      file: req.file,
      userId: req.user!.id,
      type: req.body.type,
      metadata: req.body.metadata
    };

    // Process file upload and get URL
    const fileUrl = await processFileUpload(uploadRequest);

    const now = new Date().toISOString();
    const mediaUpload: Omit<MediaUpload, '_id' | '_rev'> = {
      type: 'media',
      userId: req.user!.id,
      mediaType: getMediaType(req.file.mimetype),
      filename: req.file.originalname,
      url: fileUrl,
      thumbnailUrl: req.body.type === 'avatar' ? fileUrl : undefined,
      size: req.file.size,
      mimeType: req.file.mimetype,
      metadata: req.body.metadata,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now
    };

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const upload = await DatabaseService.create<MediaUpload>(mediaUpload);

    logger.info(`Media uploaded: ${upload._id} by user ${req.user?.id}`);

    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    logger.error('Error uploading media:', error);
    next(error);
  }
};

// Helper function to process file upload
const processFileUpload = async (request: FileUploadRequest): Promise<string> => {
  // Implementation would depend on your file storage solution (S3, local, etc.)
  // For now, return a mock URL
  return `https://storage.example.com/${request.userId}/${request.file.filename}`;
};

// Helper function to determine media type
const getMediaType = (mimeType: string): 'image' | 'document' | 'video' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
};