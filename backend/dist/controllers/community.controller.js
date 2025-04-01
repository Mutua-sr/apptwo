"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteMember = exports.leaveCommunity = exports.deleteCommunity = exports.getCommunities = exports.joinCommunity = exports.updateCommunity = exports.getCommunity = exports.createCommunity = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
const createCommunity = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Validate required fields
        if (!((_b = req.body.name) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new errorHandler_1.ApiError('Name is required', 400);
        }
        if (!((_c = req.body.description) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new errorHandler_1.ApiError('Description is required', 400);
        }
        const communityData = {
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
                isPrivate: (_e = (_d = req.body.settings) === null || _d === void 0 ? void 0 : _d.isPrivate) !== null && _e !== void 0 ? _e : false,
                requiresApproval: (_g = (_f = req.body.settings) === null || _f === void 0 ? void 0 : _f.requiresApproval) !== null && _g !== void 0 ? _g : false,
                allowPosts: (_j = (_h = req.body.settings) === null || _h === void 0 ? void 0 : _h.allowPosts) !== null && _j !== void 0 ? _j : true,
                allowEvents: (_l = (_k = req.body.settings) === null || _k === void 0 ? void 0 : _k.allowEvents) !== null && _l !== void 0 ? _l : true,
                allowPolls: (_o = (_m = req.body.settings) === null || _m === void 0 ? void 0 : _m.allowPolls) !== null && _o !== void 0 ? _o : true
            },
            stats: {
                memberCount: 1,
                postCount: 0,
                activeMembers: 1
            },
            tags: req.body.tags || []
        };
        const community = await database_1.DatabaseService.create(communityData);
        logger_1.default.info(`Community created: ${community._id} by user ${req.user.id}`);
        res.status(201).json({
            success: true,
            data: community
        });
    }
    catch (error) {
        logger_1.default.error('Error creating community:', error);
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
        // If community is private, check if user is a member
        if (community.settings.isPrivate &&
            !community.members.some(member => { var _a; return member.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to view this community', 403);
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
            ...(req.body.name && { name: req.body.name.trim() }),
            ...(req.body.description && { description: req.body.description.trim() }),
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
const joinCommunity = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user is already a member
        if (community.members.some(member => { var _a; return member.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Already a member of this community', 400);
        }
        // If community requires approval, create join request
        if (community.settings.requiresApproval) {
            const now = new Date().toISOString();
            const joinRequest = {
                type: 'join_request',
                communityId: id,
                userId: req.user.id,
                message: req.body.message,
                status: 'pending',
                createdAt: now,
                updatedAt: now
            };
            // Store join request in database
            await database_1.DatabaseService.create({
                ...joinRequest,
                type: 'join_request'
            });
            // Notify admins about join request
            const admins = community.members.filter(m => m.role === 'admin');
            admins.forEach(admin => {
                realtime_service_1.RealtimeService.getInstance().emitToUser(admin.id, 'join_request', joinRequest);
            });
            res.json({
                success: true,
                data: community
            });
            return;
        }
        // Add member directly if no approval required
        const newMember = {
            id: req.user.id,
            name: req.user.name,
            avatar: (_a = req.user) === null || _a === void 0 ? void 0 : _a.avatar,
            role: 'member',
            joinedAt: new Date().toISOString()
        };
        const updatedCommunity = await database_1.DatabaseService.update(id, {
            members: [...community.members, newMember],
            stats: {
                ...community.stats,
                memberCount: community.stats.memberCount + 1,
                activeMembers: community.stats.activeMembers + 1
            }
        });
        // Notify about new member
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
const getCommunities = async (req, res, next) => {
    var _a, _b, _c;
    try {
        const { filter = 'all' } = req.query;
        let query = {
            selector: {
                type: 'community'
            }
        };
        // Filter communities based on user's membership
        if (filter === 'member') {
            query.selector.members = {
                $elemMatch: {
                    id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
                }
            };
        }
        else if (filter === 'admin') {
            query.selector.members = {
                $elemMatch: {
                    id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    role: 'admin'
                }
            };
        }
        else {
            // For 'all', only include public communities and ones user is member of
            query = {
                selector: {
                    type: 'community',
                    $or: [
                        { 'settings.isPrivate': false },
                        {
                            members: {
                                $elemMatch: {
                                    id: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id
                                }
                            }
                        }
                    ]
                }
            };
        }
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
const leaveCommunity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        const memberIndex = community.members.findIndex(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (memberIndex === -1) {
            throw new errorHandler_1.ApiError('Not a member of this community', 400);
        }
        // Check if user is the only admin
        if (community.members[memberIndex].role === 'admin' &&
            community.members.filter(m => m.role === 'admin').length === 1) {
            throw new errorHandler_1.ApiError('Cannot leave community as the only admin. Transfer ownership first.', 400);
        }
        const updatedMembers = [...community.members];
        updatedMembers.splice(memberIndex, 1);
        const updatedCommunity = await database_1.DatabaseService.update(id, {
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
    }
    catch (error) {
        next(error);
    }
};
exports.leaveCommunity = leaveCommunity;
const inviteMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const community = await database_1.DatabaseService.read(id);
        if (!community) {
            throw new errorHandler_1.ApiError('Community not found', 404);
        }
        // Check if user has permission to invite
        const member = community.members.find(m => { var _a; return m.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (!member || !['admin', 'moderator'].includes(member.role)) {
            throw new errorHandler_1.ApiError('Not authorized to invite members', 403);
        }
        // Create invite
        const now = new Date().toISOString();
        const invite = {
            type: 'invite',
            communityId: id,
            inviterId: req.user.id,
            inviteeId: userId,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        const createdInvite = await database_1.DatabaseService.create(invite);
        // Notify invitee
        realtime_service_1.RealtimeService.getInstance().emitToUser(userId, 'community_invite', {
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
    }
    catch (error) {
        next(error);
    }
};
exports.inviteMember = inviteMember;
//# sourceMappingURL=community.controller.js.map