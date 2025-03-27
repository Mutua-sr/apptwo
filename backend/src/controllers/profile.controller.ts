import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { UserProfile, Activity, Notification, MediaUpload } from '../types/profile';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// Use the built-in Express.Multer.File type
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Check if requesting own profile or has permission
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      throw new ApiError('Not authorized to access this profile', 403);
    }

    const profile = await DatabaseService.find<UserProfile>({
      selector: {
        type: 'profile',
        userId
      }
    });

    if (!profile.length) {
      throw new ApiError('Profile not found', 404);
    }

    res.json({
      success: true,
      data: profile[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Check if updating own profile
    if (userId !== req.user?.id) {
      throw new ApiError('Not authorized to update this profile', 403);
    }

    const profile = await DatabaseService.find<UserProfile>({
      selector: {
        type: 'profile',
        userId
      }
    });

    if (!profile.length) {
      throw new ApiError('Profile not found', 404);
    }

    const updateData: Partial<UserProfile> = {
      ...(req.body.username && { username: req.body.username }),
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.avatar && { avatar: req.body.avatar }),
      ...(req.body.bio && { bio: req.body.bio }),
      ...(req.body.settings && {
        settings: {
          ...profile[0].settings,
          ...req.body.settings,
          notifications: {
            ...profile[0].settings.notifications,
            ...req.body.settings?.notifications
          },
          privacy: {
            ...profile[0].settings.privacy,
            ...req.body.settings?.privacy
          }
        }
      }),
      ...(req.body.social && { social: { ...profile[0].social, ...req.body.social } }),
      ...(req.body.education && { education: req.body.education }),
      ...(req.body.skills && { skills: req.body.skills }),
      ...(req.body.interests && { interests: req.body.interests })
    };

    const updatedProfile = await DatabaseService.update<UserProfile>(profile[0]._id, updateData);

    // Notify about profile update
    RealtimeService.getInstance().emitToUser(userId, 'profile_updated', updatedProfile);

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMedia = async (
  req: MulterRequest & AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }

    const { mimetype, size, originalname } = req.file;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('Unauthorized', 401);
    }

    // TODO: Implement actual file upload to cloud storage
    const uploadResult = {
      url: `https://storage.example.com/${userId}/${uuidv4()}/${originalname}`,
      thumbnailUrl: mimetype.startsWith('image/') ? 
        `https://storage.example.com/${userId}/${uuidv4()}/${originalname}_thumb` : 
        undefined
    };

    const mediaUpload: Omit<MediaUpload, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'media',
      userId,
      mediaType: mimetype.startsWith('image/') ? 'image' : 
                 mimetype.startsWith('video/') ? 'video' : 'document',
      filename: originalname,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      size,
      mimeType: mimetype,
      metadata: {
        // TODO: Extract metadata based on file type
      },
      uploadedAt: new Date().toISOString()
    };

    const savedMedia = await DatabaseService.create<MediaUpload>(mediaUpload);

    res.json({
      success: true,
      data: savedMedia
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if requesting own activities or has permission
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      throw new ApiError('Not authorized to access these activities', 403);
    }

    const activities = await DatabaseService.find<Activity>({
      selector: {
        type: 'activity',
        userId
      },
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      sort: [{ timestamp: 'desc' } as { [key: string]: 'desc' | 'asc' }]
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      throw new ApiError('Unauthorized', 401);
    }

    const notifications = await DatabaseService.find<Notification>({
      selector: {
        type: 'notification',
        userId
      },
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      sort: [{ createdAt: 'desc' } as { [key: string]: 'desc' | 'asc' }]
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('Unauthorized', 401);
    }

    const notification = await DatabaseService.read<Notification>(notificationId);

    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new ApiError('Not authorized to update this notification', 403);
    }

    const updatedNotification = await DatabaseService.update<Notification>(notificationId, {
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

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('Unauthorized', 401);
    }

    const notifications = await DatabaseService.find<Notification>({
      selector: {
        type: 'notification',
        userId,
        read: false
      }
    });

    const timestamp = new Date().toISOString();
    const updatePromises = notifications.map(notification =>
      DatabaseService.update<Notification>(notification._id, {
        read: true,
        readAt: timestamp
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      data: { message: 'All notifications marked as read' }
    });
  } catch (error) {
    next(error);
  }
};