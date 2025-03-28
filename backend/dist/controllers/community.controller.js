"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveCommunity = exports.joinCommunity = exports.deleteCommunity = exports.updateCommunity = exports.getCommunity = exports.createCommunity = exports.getCommunities = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const getCommunities = async (req, res, next) => {
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
            sort: [{ createdAt: 'desc' }]
        };
        const communities = await database_1.DatabaseService.find(query);
        res.json({
            success: true,
            data: communities
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCommunities = getCommunities;
const createCommunity = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const timestamp = new Date().toISOString();
        const communityData = {
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
                isPrivate: (_c = (_b = req.body.settings) === null || _b === void 0 ? void 0 : _b.isPrivate) !== null && _c !== void 0 ? _c : false,
                requiresApproval: (_e = (_d = req.body.settings) === null || _d === void 0 ? void 0 : _d.requiresApproval) !== null && _e !== void 0 ? _e : false,
                allowPosts: (_g = (_f = req.body.settings) === null || _f === void 0 ? void 0 : _f.allowPosts) !== null && _g !== void 0 ? _g : true,
                allowEvents: (_j = (_h = req.body.settings) === null || _h === void 0 ? void 0 : _h.allowEvents) !== null && _j !== void 0 ? _j : true,
                allowPolls: (_l = (_k = req.body.settings) === null || _k === void 0 ? void 0 : _k.allowPolls) !== null && _l !== void 0 ? _l : true
            },
            stats: {
                memberCount: 1,
                postCount: 0,
                activeMembers: 1
            },
            tags: req.body.tags || []
        };
        const community = await database_1.DatabaseService.create(communityData);
        // Notify about new community creation
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('communities', 'community_created', community);
        res.status(201).json({
            success: true,
            data: community
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCommunity = createCommunity;
const getCommunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user can access this community
        if (community.settings.isPrivate && !community.members.some(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to access this community', 403);
        }
        res.json({
            success: true,
            data: community
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCommunity = getCommunity;
const updateCommunity = async (req, res, next) => {
    var _a, _b, _c, _d, _e;
    try {
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user is admin
        const member = community.members.find(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (!member || member.role !== 'admin') {
            throw new errorHandler_1.ApiError('Not authorized to update this community', 403);
        }
        const updateData = {
            ...(req.body.name && { name: req.body.name }),
            ...(req.body.description && { description: req.body.description }),
            ...(req.body.avatar && { avatar: req.body.avatar }),
            ...(req.body.banner && { banner: req.body.banner }),
            ...(req.body.settings && {
                settings: {
                    isPrivate: (_a = req.body.settings.isPrivate) !== null && _a !== void 0 ? _a : community.settings.isPrivate,
                    requiresApproval: (_b = req.body.settings.requiresApproval) !== null && _b !== void 0 ? _b : community.settings.requiresApproval,
                    allowPosts: (_c = req.body.settings.allowPosts) !== null && _c !== void 0 ? _c : community.settings.allowPosts,
                    allowEvents: (_d = req.body.settings.allowEvents) !== null && _d !== void 0 ? _d : community.settings.allowEvents,
                    allowPolls: (_e = req.body.settings.allowPolls) !== null && _e !== void 0 ? _e : community.settings.allowPolls
                }
            }),
            ...(req.body.tags && { tags: req.body.tags })
        };
        const updatedCommunity = await database_1.DatabaseService.update(id, updateData);
        // Notify members about community update
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'community_updated', updatedCommunity);
        res.json({
            success: true,
            data: updatedCommunity
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCommunity = updateCommunity;
const deleteCommunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user is admin
        const member = community.members.find(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (!member || member.role !== 'admin') {
            throw new errorHandler_1.ApiError('Not authorized to delete this community', 403);
        }
        await database_1.DatabaseService.delete(id);
        // Notify members about community deletion
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'community_deleted', { id });
        res.json({
            success: true,
            data: { message: 'Community deleted successfully' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCommunity = deleteCommunity;
const joinCommunity = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user is already a member
        if (community.members.some(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Already a member of this community', 400);
        }
        const newMember = {
            id: req.user.id,
            name: req.user.name,
            avatar: req.user.avatar,
            role: 'member',
            joinedAt: new Date().toISOString()
        };
        const updatedCommunity = await database_1.DatabaseService.update(id, {
            members: [...community.members, newMember],
            stats: {
                ...community.stats,
                memberCount: community.stats.memberCount + 1
            }
        });
        // Notify members about new member
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'member_joined', {
            communityId: id,
            member: newMember
        });
        res.json({
            success: true,
            data: updatedCommunity
        });
    }
    catch (error) {
        next(error);
    }
};
exports.joinCommunity = joinCommunity;
const leaveCommunity = async (req, res, next) => {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user is a member
        if (!community.members.some(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not a member of this community', 400);
        }
        // Check if user is the only admin
        const isOnlyAdmin = ((_b = community.members.find(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) === null || _b === void 0 ? void 0 : _b.role) === 'admin' &&
            community.members.filter(m => m.role === 'admin').length === 1;
        if (isOnlyAdmin) {
            throw new errorHandler_1.ApiError('Cannot leave community as the only admin', 400);
        }
        const updatedCommunity = await database_1.DatabaseService.update(id, {
            members: community.members.filter(m => { var _a; return m.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }),
            stats: {
                ...community.stats,
                memberCount: community.stats.memberCount - 1
            }
        });
        // Notify members about member leaving
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'member_left', {
            communityId: id,
            userId: req.user.id
        });
        res.json({
            success: true,
            data: updatedCommunity
        });
    }
    catch (error) {
        next(error);
    }
};
exports.leaveCommunity = leaveCommunity;
//# sourceMappingURL=community.controller.js.map