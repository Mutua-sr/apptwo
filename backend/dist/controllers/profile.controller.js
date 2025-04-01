"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.markNotificationRead = exports.markAllNotificationsRead = exports.getNotifications = exports.getActivities = exports.updateProfile = exports.getProfile = void 0;
const database_1 = require("../services/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
const getProfile = async (req, res, next) => {
    var _a, _b, _c, _d, _e;
    try {
        const { id } = req.params;
        logger_1.default.info(`Fetching profile with ID: ${id}`);
        // Log the auth token for debugging
        const token = req.header('Authorization');
        logger_1.default.info(`Auth token present: ${!!token}`);
        const profile = await database_1.DatabaseService.read(id);
        logger_1.default.info('Database response:', {
            profileExists: !!profile,
            id: profile === null || profile === void 0 ? void 0 : profile._id,
            type: profile === null || profile === void 0 ? void 0 : profile.type,
            userId: profile === null || profile === void 0 ? void 0 : profile.userId
        });
        if (!profile) {
            logger_1.default.warn(`Profile not found with ID: ${id}`);
            throw new errorHandler_1.ApiError('Profile not found', 404);
        }
        // Verify profile belongs to a valid user
        const users = await database_1.DatabaseService.find({
            selector: {
                type: 'user',
                _id: profile.userId
            }
        });
        if (!users.length) {
            logger_1.default.error(`No user found for profile ${id} with userId ${profile.userId}`);
            throw new errorHandler_1.ApiError('Invalid profile - no associated user', 500);
        }
        // Verify profile type
        if (!profile.type || profile.type !== 'profile') {
            logger_1.default.error(`Invalid profile type for profile with ID: ${id}`);
            throw new errorHandler_1.ApiError('Invalid profile document', 500);
        }
        // Create a sanitized copy of the profile based on privacy settings
        const sanitizedProfile = { ...profile };
        if (profile._id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.profileId)) {
            if (!((_c = (_b = profile.settings) === null || _b === void 0 ? void 0 : _b.privacy) === null || _c === void 0 ? void 0 : _c.showEmail)) {
                sanitizedProfile.email = '';
            }
            if (!((_e = (_d = profile.settings) === null || _d === void 0 ? void 0 : _d.privacy) === null || _e === void 0 ? void 0 : _e.showActivity)) {
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
            data: sanitizedProfile
        });
    }
    catch (error) {
        logger_1.default.error('Error in getProfile:', error);
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    var _a, _b;
    try {
        const { id } = req.params;
        const profile = await database_1.DatabaseService.read(id);
        if (!profile) {
            throw new errorHandler_1.ApiError('Profile not found', 404);
        }
        // Only allow users to update their own profile
        if (profile._id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.profileId)) {
            throw new errorHandler_1.ApiError('Not authorized to update this profile', 403);
        }
        const updateData = {
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
        const updatedProfile = await database_1.DatabaseService.update(id, updateData);
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        logger_1.default.info(`Profile ${id} updated by user ${req.user.id}`);
        res.json({
            success: true,
            data: updatedProfile
        });
    }
    catch (error) {
        logger_1.default.error('Error updating profile:', error);
        next(error);
    }
};
exports.updateProfile = updateProfile;
const getActivities = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const activities = await database_1.DatabaseService.find({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getActivities = getActivities;
const getNotifications = async (req, res, next) => {
    var _a;
    try {
        const { page = 1, limit = 10, unreadOnly = false } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const notifications = await database_1.DatabaseService.find({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAllNotificationsRead = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Find all unread notifications for the user
        const notifications = await database_1.DatabaseService.find({
            selector: {
                type: 'notification',
                userId: req.user.id,
                read: false
            }
        });
        // Update all notifications to read
        const now = new Date().toISOString();
        await Promise.all(notifications.map(notification => database_1.DatabaseService.update(notification._id, {
            read: true,
            readAt: now
        })));
        res.json({
            success: true,
            data: { message: 'All notifications marked as read' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const markNotificationRead = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const notification = await database_1.DatabaseService.read(id);
        if (!notification) {
            throw new errorHandler_1.ApiError('Notification not found', 404);
        }
        if (notification.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to update this notification', 403);
        }
        const updatedNotification = await database_1.DatabaseService.update(id, {
            read: true,
            readAt: new Date().toISOString()
        });
        res.json({
            success: true,
            data: updatedNotification
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationRead = markNotificationRead;
const uploadMedia = async (req, res, next) => {
    var _a, _b;
    try {
        if (!req.file) {
            throw new errorHandler_1.ApiError('No file uploaded', 400);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Process file upload and get URL
        const now = new Date().toISOString();
        const mediaUpload = {
            type: 'media',
            userId: req.user.id,
            mediaType: getMediaType(req.file.mimetype),
            filename: req.file.originalname,
            url: `https://storage.example.com/${req.user.id}/${req.file.filename}`,
            thumbnailUrl: req.body.type === 'avatar' ? `https://storage.example.com/${req.user.id}/${req.file.filename}` : undefined,
            size: req.file.size,
            mimeType: req.file.mimetype,
            metadata: req.body.metadata,
            uploadedAt: now,
            createdAt: now,
            updatedAt: now
        };
        const upload = await database_1.DatabaseService.create(mediaUpload);
        logger_1.default.info(`Media ${upload._id} uploaded by user ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.id}`);
        res.json({
            success: true,
            data: upload
        });
    }
    catch (error) {
        logger_1.default.error('Error uploading media:', error);
        next(error);
    }
};
exports.uploadMedia = uploadMedia;
// Helper function to determine media type
const getMediaType = (mimeType) => {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/'))
        return 'video';
    return 'document';
};
//# sourceMappingURL=profile.controller.js.map