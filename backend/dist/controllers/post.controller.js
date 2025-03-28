"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostsForAllUsers = exports.deletePost = exports.updatePost = exports.getPost = exports.getPosts = exports.createPost = void 0;
const database_1 = require("../services/database");
const createPost = async (req, res, next) => {
    var _a;
    try {
        const { title, content, tags, sharedTo } = req.body;
        if (!title || !content) {
            const error = new Error('Title and content are required');
            error.statusCode = 400;
            throw error;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            const error = new Error('User not authenticated');
            error.statusCode = 401;
            throw error;
        }
        // First create the basic post data
        const createPostData = {
            type: 'post',
            title,
            content,
            author: {
                id: req.user.id,
                username: req.user.name, // Use name from AuthUser as username
                avatar: req.user.avatar
            },
            tags: tags || []
        };
        // Then add the required Post properties
        const fullPostData = {
            ...createPostData,
            likes: 0,
            comments: [],
            likedBy: [],
            ...(sharedTo && { sharedTo })
        };
        const post = await database_1.DatabaseService.create(fullPostData);
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
const getPosts = async (_req, res, next) => {
    try {
        const posts = await database_1.DatabaseService.find({
            selector: {
                type: 'post'
            }
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
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
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
const updatePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.author.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            const error = new Error('Not authorized to update this post');
            error.statusCode = 403;
            throw error;
        }
        const updatedPost = await database_1.DatabaseService.update(id, {
            title: title || post.title,
            content: content || post.content,
            tags: tags || post.tags
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
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const post = await database_1.DatabaseService.read(id);
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.author.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            const error = new Error('Not authorized to delete this post');
            error.statusCode = 403;
            throw error;
        }
        await database_1.DatabaseService.delete(id);
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
const createPostsForAllUsers = async (res, next) => {
    try {
        // Fetch all users
        const users = await database_1.DatabaseService.find({
            selector: {
                type: 'user'
            }
        });
        const posts = []; // Ensure posts is of type Post[]
        // Create a post for each user
        for (const user of users) {
            const createPostData = {
                type: 'post',
                title: `Post by ${user.name}`,
                content: `This is a post created for ${user.name}.`,
                author: {
                    id: user._id,
                    username: user.name,
                    avatar: user.avatar
                },
                tags: []
            };
            const fullPostData = {
                ...createPostData,
                likes: 0,
                comments: [],
                likedBy: []
            };
            const post = await database_1.DatabaseService.create(fullPostData);
            posts.push(post);
        }
        res.status(201).json({
            success: true,
            data: posts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPostsForAllUsers = createPostsForAllUsers;
// Other existing functions...
//# sourceMappingURL=post.controller.js.map