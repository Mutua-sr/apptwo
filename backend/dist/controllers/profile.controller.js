"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getNotifications = exports.getActivities = exports.uploadMedia = exports.updateProfile = exports.getProfile = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
const getProfile = async (req, res, next) => {
    var _a, _b;
    try {
        const { userId } = req.params;
        // Check if requesting own profile or has permission
        if (userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new errorHandler_1.ApiError('Not authorized to access this profile', 403);
        }
        const profile = await database_1.DatabaseService.find({
            selector: {
                type: 'profile',
                userId
            }
        });
        if (!profile.length) {
            throw new errorHandler_1.ApiError('Profile not found', 404);
        }
        res.json({
            success: true,
            data: profile[0]
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    var _a, _b, _c;
    try {
        const { userId } = req.params;
        // Check if updating own profile
        if (userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to update this profile', 403);
        }
        const profile = await database_1.DatabaseService.find({
            selector: {
                type: 'profile',
                userId
            }
        });
        if (!profile.length) {
            throw new errorHandler_1.ApiError('Profile not found', 404);
        }
        const updateData = {
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
                        ...(_b = req.body.settings) === null || _b === void 0 ? void 0 : _b.notifications
                    },
                    privacy: {
                        ...profile[0].settings.privacy,
                        ...(_c = req.body.settings) === null || _c === void 0 ? void 0 : _c.privacy
                    }
                }
            }),
            ...(req.body.social && { social: { ...profile[0].social, ...req.body.social } }),
            ...(req.body.education && { education: req.body.education }),
            ...(req.body.skills && { skills: req.body.skills }),
            ...(req.body.interests && { interests: req.body.interests })
        };
        const updatedProfile = await database_1.DatabaseService.update(profile[0]._id, updateData);
        // Notify about profile update
        realtime_service_1.RealtimeService.getInstance().emitToUser(userId, 'profile_updated', updatedProfile);
        res.json({
            success: true,
            data: updatedProfile
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadMedia = async (req, res, next) => {
    var _a;
    try {
        if (!req.file) {
            throw new errorHandler_1.ApiError('No file uploaded', 400);
        }
        const { mimetype, size, originalname } = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // TODO: Implement actual file upload to cloud storage
        const uploadResult = {
            url: `https://storage.example.com/${userId}/${(0, uuid_1.v4)()}/${originalname}`,
            thumbnailUrl: mimetype.startsWith('image/') ?
                `https://storage.example.com/${userId}/${(0, uuid_1.v4)()}/${originalname}_thumb` :
                undefined
        };
        const mediaUpload = {
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
        const savedMedia = await database_1.DatabaseService.create(mediaUpload);
        res.json({
            success: true,
            data: savedMedia
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadMedia = uploadMedia;
const getActivities = async (req, res, next) => {
    var _a, _b;
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        // Check if requesting own activities or has permission
        if (userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new errorHandler_1.ApiError('Not authorized to access these activities', 403);
        }
        const activities = await database_1.DatabaseService.find({
            selector: {
                type: 'activity',
                userId
            },
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit),
            sort: [{ timestamp: 'desc' }]
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page = 1, limit = 20 } = req.query;
        if (!userId) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const notifications = await database_1.DatabaseService.find({
            selector: {
                type: 'notification',
                userId
            },
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit),
            sort: [{ createdAt: 'desc' }]
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
const markNotificationRead = async (req, res, next) => {
    var _a;
    try {
        const { notificationId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const notification = await database_1.DatabaseService.read(notificationId);
        if (!notification) {
            throw new errorHandler_1.ApiError('Notification not found', 404);
        }
        if (notification.userId !== userId) {
            throw new errorHandler_1.ApiError('Not authorized to update this notification', 403);
        }
        const updatedNotification = await database_1.DatabaseService.update(notificationId, {
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
const markAllNotificationsRead = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const notifications = await database_1.DatabaseService.find({
            selector: {
                type: 'notification',
                userId,
                read: false
            }
        });
        const timestamp = new Date().toISOString();
        const updatePromises = notifications.map(notification => database_1.DatabaseService.update(notification._id, {
            read: true,
            readAt: timestamp
        }));
        await Promise.all(updatePromises);
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
//# sourceMappingURL=profile.controller.js.map