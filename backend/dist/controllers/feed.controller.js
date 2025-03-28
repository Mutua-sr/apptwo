"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharePost = exports.addComment = exports.unlikePost = exports.likePost = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const getPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const posts = await database_1.DatabaseService.find({
            selector: {
                type: 'post'
            },
            skip,
            limit: Number(limit),
            sort: [{ createdAt: 'desc' }]
        });
        res.json({
            success: true,
            data: posts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPosts = getPosts;
const getPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPost = getPost;
const createPost = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const postData = {
            type: 'post',
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tags || [],
            author: {
                id: req.user.id,
                username: req.user.name,
                avatar: req.user.avatar
            }
        };
        const post = await database_1.DatabaseService.create({
            ...postData,
            likes: 0,
            comments: [],
            likedBy: []
        });
        // Notify followers or relevant users about the new post
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'new_post', post);
        res.status(201).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPost = createPost;
const updatePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        if (post.author.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to update this post', 403);
        }
        const updateData = {
            ...(req.body.title && { title: req.body.title }),
            ...(req.body.content && { content: req.body.content }),
            ...(req.body.tags && { tags: req.body.tags }),
            ...(req.body.sharedTo && { sharedTo: req.body.sharedTo })
        };
        const updatedPost = await database_1.DatabaseService.update(id, updateData);
        // Notify about post update
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'post_updated', updatedPost);
        res.json({
            success: true,
            data: updatedPost
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        if (post.author.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to delete this post', 403);
        }
        await database_1.DatabaseService.delete(id);
        // Notify about post deletion
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'post_deleted', { id });
        res.json({
            success: true,
            data: { message: 'Post deleted successfully' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePost = deletePost;
const likePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Check if user already liked the post
        if (post.likedBy.includes(req.user.id)) {
            throw new errorHandler_1.ApiError('Post already liked', 400);
        }
        const updatedPost = await database_1.DatabaseService.update(id, {
            likes: post.likes + 1,
            likedBy: [...post.likedBy, req.user.id]
        });
        // Notify about post like
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'post_liked', {
            postId: id,
            userId: req.user.id,
            likes: updatedPost.likes
        });
        res.json({
            success: true,
            data: updatedPost
        });
    }
    catch (error) {
        next(error);
    }
};
exports.likePost = likePost;
const unlikePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Check if user hasn't liked the post
        if (!post.likedBy.includes(req.user.id)) {
            throw new errorHandler_1.ApiError('Post not liked', 400);
        }
        const updatedPost = await database_1.DatabaseService.update(id, {
            likes: Math.max(0, post.likes - 1),
            likedBy: post.likedBy.filter(userId => { var _a; return userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })
        });
        // Notify about post unlike
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'post_unliked', {
            postId: id,
            userId: req.user.id,
            likes: updatedPost.likes
        });
        res.json({
            success: true,
            data: updatedPost
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unlikePost = unlikePost;
const addComment = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const comment = {
            id: `comment_${Date.now()}`,
            author: req.user.name,
            avatar: req.user.avatar,
            content: req.body.content,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        const updatedPost = await database_1.DatabaseService.update(id, {
            comments: [...post.comments, comment]
        });
        // Notify about new comment
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom('feed', 'new_comment', {
            postId: id,
            comment
        });
        res.json({
            success: true,
            data: updatedPost
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addComment = addComment;
const sharePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const { type, targetId } = req.body;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            throw new errorHandler_1.ApiError('Post not found', 404);
        }
        // Verify target exists and has correct type
        const target = await database_1.DatabaseService.read(targetId);
        if (!target) {
            throw new errorHandler_1.ApiError(`${type} not found`, 404);
        }
        // Verify the target type matches the requested type
        if (target.type !== type) {
            throw new errorHandler_1.ApiError(`Invalid ${type} ID`, 400);
        }
        const updatedPost = await database_1.DatabaseService.update(id, {
            sharedTo: {
                type,
                id: targetId,
                name: target.name
            }
        });
        // Notify about post share
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(targetId, 'post_shared', {
            post: updatedPost,
            sharedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        });
        res.json({
            success: true,
            data: updatedPost
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sharePost = sharePost;
//# sourceMappingURL=feed.controller.js.map