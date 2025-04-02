"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
const database_1 = __importDefault(require("../services/database"));
const resolvers = {
    Query: {
        // Community queries
        community: async (_, { id }) => {
            try {
                return await database_1.default.read(id);
            }
            catch (error) {
                logger_1.default.error(`Error in community query: ${error}`);
                throw error;
            }
        },
        communities: async (_, { page, limit }) => {
            try {
                const skip = page ? (page - 1) * (limit || 10) : 0;
                const query = {
                    selector: {
                        type: 'community'
                    },
                    skip,
                    limit: limit || 10,
                    sort: [{ createdAt: 'desc' }]
                };
                return await database_1.default.find(query);
            }
            catch (error) {
                logger_1.default.error(`Error in communities query: ${error}`);
                throw error;
            }
        },
        // Post queries
        post: async (_, { id }) => {
            try {
                return await database_1.default.read(id);
            }
            catch (error) {
                logger_1.default.error(`Error in post query: ${error}`);
                throw error;
            }
        },
        posts: async (_, { page, limit }) => {
            try {
                const skip = page ? (page - 1) * (limit || 10) : 0;
                const query = {
                    selector: {
                        type: 'post'
                    },
                    skip,
                    limit: limit || 10,
                    sort: [{ createdAt: 'desc' }]
                };
                return await database_1.default.find(query);
            }
            catch (error) {
                logger_1.default.error(`Error in posts query: ${error}`);
                throw error;
            }
        }
    },
    Mutation: {
        // Community mutations
        createCommunity: async (_, { input }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                const communityData = {
                    type: 'community',
                    name: input.name || '',
                    description: input.description || '',
                    creator: input.creator,
                    members: [],
                    settings: {
                        isPrivate: (_b = (_a = input.settings) === null || _a === void 0 ? void 0 : _a.isPrivate) !== null && _b !== void 0 ? _b : false,
                        requiresApproval: (_d = (_c = input.settings) === null || _c === void 0 ? void 0 : _c.requiresApproval) !== null && _d !== void 0 ? _d : false,
                        allowPosts: (_f = (_e = input.settings) === null || _e === void 0 ? void 0 : _e.allowPosts) !== null && _f !== void 0 ? _f : true,
                        allowEvents: (_h = (_g = input.settings) === null || _g === void 0 ? void 0 : _g.allowEvents) !== null && _h !== void 0 ? _h : true,
                        allowPolls: (_k = (_j = input.settings) === null || _j === void 0 ? void 0 : _j.allowPolls) !== null && _k !== void 0 ? _k : true
                    },
                    stats: {
                        memberCount: 1, // Creator is first member
                        postCount: 0,
                        activeMembers: 1
                    },
                    tags: input.tags || []
                };
                return await database_1.default.create(communityData);
            }
            catch (error) {
                logger_1.default.error(`Error in createCommunity mutation: ${error}`);
                throw error;
            }
        },
        updateCommunity: async (_, { id, input }) => {
            try {
                return await database_1.default.update(id, input);
            }
            catch (error) {
                logger_1.default.error(`Error in updateCommunity mutation: ${error}`);
                throw error;
            }
        },
        deleteCommunity: async (_, { id }) => {
            try {
                await database_1.default.delete(id);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error in deleteCommunity mutation: ${error}`);
                throw error;
            }
        },
        // Post mutations
        createPost: async (_, { input }) => {
            try {
                const postData = {
                    type: 'post',
                    title: input.title,
                    content: input.content,
                    author: input.author,
                    tags: input.tags,
                    likes: 0,
                    comments: [],
                    likedBy: [],
                    status: input.status || 'draft',
                    visibility: input.visibility || 'private'
                };
                return await database_1.default.create(postData);
            }
            catch (error) {
                logger_1.default.error(`Error in createPost mutation: ${error}`);
                throw error;
            }
        },
        updatePost: async (_, { id, input }) => {
            try {
                return await database_1.default.update(id, input);
            }
            catch (error) {
                logger_1.default.error(`Error in updatePost mutation: ${error}`);
                throw error;
            }
        },
        deletePost: async (_, { id }) => {
            try {
                await database_1.default.delete(id);
                return true;
            }
            catch (error) {
                logger_1.default.error(`Error in deletePost mutation: ${error}`);
                throw error;
            }
        }
    }
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map