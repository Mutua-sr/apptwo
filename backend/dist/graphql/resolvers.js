"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
const database_1 = __importDefault(require("../services/database"));
const resolvers = {
    Query: {
        // Classroom queries
        classrooms: async (_, { page = 1, limit = 10 }) => {
            try {
                const classrooms = await database_1.default.list({ limit, skip: (page - 1) * limit });
                return classrooms;
            }
            catch (error) {
                logger_1.default.error('Error fetching classrooms:', error);
                throw new Error('Failed to fetch classrooms');
            }
        },
        classroom: async (_, { id }) => {
            try {
                const classroom = await database_1.default.read(id);
                return classroom;
            }
            catch (error) {
                logger_1.default.error(`Error fetching classroom ${id}:`, error);
                throw new Error('Failed to fetch classroom');
            }
        },
        // Community queries
        communities: async (_, { page = 1, limit = 10 }) => {
            try {
                const communities = await database_1.default.list({ limit, skip: (page - 1) * limit });
                return communities;
            }
            catch (error) {
                logger_1.default.error('Error fetching communities:', error);
                throw new Error('Failed to fetch communities');
            }
        },
        community: async (_, { id }) => {
            try {
                const community = await database_1.default.read(id);
                return community;
            }
            catch (error) {
                logger_1.default.error(`Error fetching community ${id}:`, error);
                throw new Error('Failed to fetch community');
            }
        },
        // Post queries
        posts: async (_, { page = 1, limit = 10 }) => {
            try {
                const posts = await database_1.default.list({ limit, skip: (page - 1) * limit });
                return posts;
            }
            catch (error) {
                logger_1.default.error('Error fetching posts:', error);
                throw new Error('Failed to fetch posts');
            }
        },
        post: async (_, { id }) => {
            try {
                const post = await database_1.default.read(id);
                return post;
            }
            catch (error) {
                logger_1.default.error(`Error fetching post ${id}:`, error);
                throw new Error('Failed to fetch post');
            }
        },
        postsByTag: async (_, { tag }) => {
            try {
                const posts = await database_1.default.find({
                    selector: {
                        type: 'post',
                        tags: { $elemMatch: { $eq: tag } }
                    },
                    sort: [{ createdAt: "desc" }]
                });
                return posts;
            }
            catch (error) {
                logger_1.default.error(`Error fetching posts by tag ${tag}:`, error);
                throw new Error('Failed to fetch posts by tag');
            }
        }
    },
    Mutation: {
        // Classroom mutations
        createClassroom: async (_, { input }) => {
            try {
                const newClassroom = await database_1.default.create(input);
                return newClassroom;
            }
            catch (error) {
                logger_1.default.error('Error creating classroom:', error);
                throw new Error('Failed to create classroom');
            }
        },
        updateClassroom: async (_, { id, input }) => {
            try {
                const updatedClassroom = await database_1.default.update(id, input);
                return updatedClassroom;
            }
            catch (error) {
                logger_1.default.error(`Error updating classroom ${id}:`, error);
                throw new Error('Failed to update classroom');
            }
        },
        deleteClassroom: async (_, { id }) => {
            try {
                await database_1.default.delete(id);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error deleting classroom ${id}:`, error);
                throw new Error('Failed to delete classroom');
            }
        },
        // Community mutations
        createCommunity: async (_, { input }) => {
            try {
                const newCommunity = await database_1.default.create(input);
                return newCommunity;
            }
            catch (error) {
                logger_1.default.error('Error creating community:', error);
                throw new Error('Failed to create community');
            }
        },
        updateCommunity: async (_, { id, input }) => {
            try {
                const updatedCommunity = await database_1.default.update(id, input);
                return updatedCommunity;
            }
            catch (error) {
                logger_1.default.error(`Error updating community ${id}:`, error);
                throw new Error('Failed to update community');
            }
        },
        deleteCommunity: async (_, { id }) => {
            try {
                await database_1.default.delete(id);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error deleting community ${id}:`, error);
                throw new Error('Failed to delete community');
            }
        },
        // Post mutations
        createPost: async (_, { input }) => {
            try {
                const newPost = await database_1.default.create(input);
                return newPost;
            }
            catch (error) {
                logger_1.default.error('Error creating post:', error);
                throw new Error('Failed to create post');
            }
        },
        updatePost: async (_, { id, input }) => {
            try {
                const updatedPost = await database_1.default.update(id, input);
                return updatedPost;
            }
            catch (error) {
                logger_1.default.error(`Error updating post ${id}:`, error);
                throw new Error('Failed to update post');
            }
        },
        deletePost: async (_, { id }) => {
            try {
                await database_1.default.delete(id);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error deleting post ${id}:`, error);
                throw new Error('Failed to delete post');
            }
        }
    }
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map