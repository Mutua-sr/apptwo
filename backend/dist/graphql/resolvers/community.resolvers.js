"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityResolvers = void 0;
const community_service_1 = __importDefault(require("../../services/community.service"));
const logger_1 = __importDefault(require("../../config/logger"));
exports.communityResolvers = {
    Query: {
        community: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await community_service_1.default.getById(id);
            }
            catch (error) {
                logger_1.default.error(`Error in community query: ${error}`);
                throw error;
            }
        },
        communities: async (_, { page, limit }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await community_service_1.default.list(page, limit);
            }
            catch (error) {
                logger_1.default.error(`Error in communities query: ${error}`);
                throw error;
            }
        },
        searchCommunities: async (_, { query, page, limit }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await community_service_1.default.searchByName(query, page, limit);
            }
            catch (error) {
                logger_1.default.error(`Error in searchCommunities query: ${error}`);
                throw error;
            }
        }
    },
    Mutation: {
        createCommunity: async (_, { input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await community_service_1.default.create(input);
            }
            catch (error) {
                logger_1.default.error(`Error in createCommunity mutation: ${error}`);
                throw error;
            }
        },
        updateCommunity: async (_, { id, input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const community = await community_service_1.default.getById(id);
                if (!community) {
                    throw new Error('Community not found');
                }
                // TODO: Add proper authorization check based on community roles
                if (context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await community_service_1.default.update(id, input);
            }
            catch (error) {
                logger_1.default.error(`Error in updateCommunity mutation: ${error}`);
                throw error;
            }
        },
        deleteCommunity: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const community = await community_service_1.default.getById(id);
                if (!community) {
                    throw new Error('Community not found');
                }
                // TODO: Add proper authorization check based on community roles
                if (context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await community_service_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error in deleteCommunity mutation: ${error}`);
                throw error;
            }
        },
        addCommunityTopic: async (_, { id, topic }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const community = await community_service_1.default.getById(id);
                if (!community) {
                    throw new Error('Community not found');
                }
                // TODO: Add proper authorization check based on community roles
                if (context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await community_service_1.default.addTopic(id, topic);
            }
            catch (error) {
                logger_1.default.error(`Error in addCommunityTopic mutation: ${error}`);
                throw error;
            }
        },
        removeCommunityTopic: async (_, { id, topic }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const community = await community_service_1.default.getById(id);
                if (!community) {
                    throw new Error('Community not found');
                }
                // TODO: Add proper authorization check based on community roles
                if (context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await community_service_1.default.removeTopic(id, topic);
            }
            catch (error) {
                logger_1.default.error(`Error in removeCommunityTopic mutation: ${error}`);
                throw error;
            }
        }
    },
    Community: {
        // Field resolvers if needed
        topics: (parent) => parent.topics || [],
        members: (parent) => parent.members || 0
    }
};
exports.default = exports.communityResolvers;
//# sourceMappingURL=community.resolvers.js.map