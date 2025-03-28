"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolvers = void 0;
const post_service_1 = __importDefault(require("../../services/post.service"));
const logger_1 = __importDefault(require("../../config/logger"));
exports.postResolvers = {
    Query: {
        post: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.getById(id);
            }
            catch (error) {
                logger_1.default.error(`Error in post query: ${error}`);
                throw error;
            }
        },
        posts: async (_, options, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.list(options);
            }
            catch (error) {
                logger_1.default.error(`Error in posts query: ${error}`);
                throw error;
            }
        },
        postsByTag: async (_, { tag, ...options }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.getByTag(tag, options);
            }
            catch (error) {
                logger_1.default.error(`Error in postsByTag query: ${error}`);
                throw error;
            }
        },
        postsByAuthor: async (_, { authorId, ...options }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.getByAuthor(authorId, options);
            }
            catch (error) {
                logger_1.default.error(`Error in postsByAuthor query: ${error}`);
                throw error;
            }
        },
        searchPosts: async (_, { query, ...options }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.search(query, options);
            }
            catch (error) {
                logger_1.default.error(`Error in searchPosts query: ${error}`);
                throw error;
            }
        }
    },
    Mutation: {
        createPost: async (_, { input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await post_service_1.default.create({
                    ...input,
                    author: {
                        id: context.user.id,
                        username: context.user.name,
                        avatar: context.user.avatar
                    }
                });
            }
            catch (error) {
                logger_1.default.error(`Error in createPost mutation: ${error}`);
                throw error;
            }
        },
        updatePost: async (_, { id, input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const post = await post_service_1.default.getById(id);
                if (!post) {
                    throw new Error('Post not found');
                }
                if (post.author.id !== context.user.id && context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await post_service_1.default.update(id, input);
            }
            catch (error) {
                logger_1.default.error(`Error in updatePost mutation: ${error}`);
                throw error;
            }
        },
        deletePost: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const post = await post_service_1.default.getById(id);
                if (!post) {
                    throw new Error('Post not found');
                }
                if (post.author.id !== context.user.id && context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await post_service_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error in deletePost mutation: ${error}`);
                throw error;
            }
        },
        likePost: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const post = await post_service_1.default.getById(id);
                if (!post) {
                    throw new Error('Post not found');
                }
                return await post_service_1.default.like(id);
            }
            catch (error) {
                logger_1.default.error(`Error in likePost mutation: ${error}`);
                throw error;
            }
        },
        unlikePost: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const post = await post_service_1.default.getById(id);
                if (!post) {
                    throw new Error('Post not found');
                }
                return await post_service_1.default.unlike(id);
            }
            catch (error) {
                logger_1.default.error(`Error in unlikePost mutation: ${error}`);
                throw error;
            }
        }
    },
    Post: {
        // Field resolvers if needed
        author: (parent) => parent.author,
        tags: (parent) => parent.tags || [],
        likes: (parent) => parent.likes || 0,
        comments: (parent) => parent.comments || 0
    }
};
exports.default = exports.postResolvers;
//# sourceMappingURL=post.resolvers.js.map