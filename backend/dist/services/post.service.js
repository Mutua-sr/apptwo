"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
class PostService {
    static async create(input) {
        try {
            const now = new Date().toISOString();
            const post = {
                ...input,
                type: 'post',
                likes: 0,
                comments: [],
                likedBy: [],
                status: input.status || 'published',
                visibility: input.visibility || 'public',
                createdAt: now,
                updatedAt: now
            };
            const result = await database_1.DatabaseService.create(post);
            return {
                ...post,
                _id: result._id,
                _rev: result._rev
            };
        }
        catch (error) {
            logger_1.default.error('Error creating post:', error);
            throw new Error('Failed to create post');
        }
    }
    static async getById(id) {
        try {
            const post = await database_1.DatabaseService.read(id);
            return post;
        }
        catch (error) {
            logger_1.default.error(`Error getting post ${id}:`, error);
            throw new Error('Failed to get post');
        }
    }
    static async list(options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const query = {
                selector: {
                    type: this.TYPE
                },
                sort: [{ createdAt: "desc" }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error('Error listing posts:', error);
            throw new Error('Failed to list posts');
        }
    }
    static async update(id, data) {
        try {
            const updated = await database_1.DatabaseService.update(id, {
                ...data,
                updatedAt: new Date().toISOString()
            });
            return updated;
        }
        catch (error) {
            logger_1.default.error(`Error updating post ${id}:`, error);
            throw new Error('Failed to update post');
        }
    }
    static async delete(id) {
        try {
            return await database_1.DatabaseService.delete(id);
        }
        catch (error) {
            logger_1.default.error(`Error deleting post ${id}:`, error);
            throw new Error('Failed to delete post');
        }
    }
    static async getByTag(tag, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const query = {
                selector: {
                    type: this.TYPE,
                    tags: { $elemMatch: { $eq: tag } }
                },
                sort: [{ createdAt: "desc" }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting posts for tag ${tag}:`, error);
            throw new Error('Failed to get posts by tag');
        }
    }
    static async getByAuthor(authorId, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const query = {
                selector: {
                    type: this.TYPE,
                    'author.id': authorId
                },
                sort: [{ createdAt: "desc" }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting posts for author ${authorId}:`, error);
            throw new Error('Failed to get posts by author');
        }
    }
    static async like(id) {
        try {
            const post = await this.getById(id);
            if (!post) {
                throw new Error('Post not found');
            }
            return await this.update(id, {
                likes: (post.likes || 0) + 1
            });
        }
        catch (error) {
            logger_1.default.error(`Error liking post ${id}:`, error);
            throw new Error('Failed to like post');
        }
    }
    static async unlike(id) {
        try {
            const post = await this.getById(id);
            if (!post) {
                throw new Error('Post not found');
            }
            return await this.update(id, {
                likes: Math.max(0, (post.likes || 0) - 1)
            });
        }
        catch (error) {
            logger_1.default.error(`Error unliking post ${id}:`, error);
            throw new Error('Failed to unlike post');
        }
    }
    static async search(query, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const searchQuery = {
                selector: {
                    type: this.TYPE,
                    $or: [
                        { title: { $regex: `(?i)${query}` } },
                        { content: { $regex: `(?i)${query}` } },
                        { tags: { $elemMatch: { $regex: `(?i)${query}` } } }
                    ]
                },
                sort: [{ createdAt: "desc" }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(searchQuery);
        }
        catch (error) {
            logger_1.default.error(`Error searching posts with query "${query}":`, error);
            throw new Error('Failed to search posts');
        }
    }
}
exports.PostService = PostService;
PostService.TYPE = 'post';
exports.default = PostService;
//# sourceMappingURL=post.service.js.map