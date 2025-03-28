"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
class CommunityService {
    static async create(input) {
        try {
            const now = new Date().toISOString();
            const community = {
                ...input,
                type: 'community',
                members: [],
                stats: {
                    memberCount: 0,
                    postCount: 0,
                    activeMembers: 0
                },
                settings: {
                    isPrivate: false,
                    requiresApproval: false,
                    allowPosts: true,
                    allowEvents: true,
                    allowPolls: true,
                    ...input.settings
                },
                tags: input.tags || [],
                createdAt: now,
                updatedAt: now
            };
            const result = await database_1.DatabaseService.create(community);
            return {
                ...community,
                _id: result._id,
                _rev: result._rev
            };
        }
        catch (error) {
            logger_1.default.error('Error creating community:', error);
            throw new Error('Failed to create community');
        }
    }
    static async getById(id) {
        try {
            const community = await database_1.DatabaseService.read(id);
            return community;
        }
        catch (error) {
            logger_1.default.error(`Error getting community ${id}:`, error);
            throw new Error('Failed to get community');
        }
    }
    static async list(page = 1, limit = 10) {
        try {
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
            logger_1.default.error('Error listing communities:', error);
            throw new Error('Failed to list communities');
        }
    }
    static async update(id, data) {
        try {
            const community = await this.getById(id);
            if (!community) {
                throw new Error('Community not found');
            }
            // Ensure settings are properly merged
            const settings = data.settings ? {
                ...community.settings,
                ...data.settings
            } : undefined;
            const updateData = {
                ...data,
                settings,
                updatedAt: new Date().toISOString()
            };
            const updated = await database_1.DatabaseService.update(id, updateData);
            return updated;
        }
        catch (error) {
            logger_1.default.error(`Error updating community ${id}:`, error);
            throw new Error('Failed to update community');
        }
    }
    static async delete(id) {
        try {
            return await database_1.DatabaseService.delete(id);
        }
        catch (error) {
            logger_1.default.error(`Error deleting community ${id}:`, error);
            throw new Error('Failed to delete community');
        }
    }
    static async getByTopic(topic) {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    tags: { $elemMatch: { $eq: topic } }
                },
                sort: [{ createdAt: "desc" }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting communities for topic ${topic}:`, error);
            throw new Error('Failed to get communities by topic');
        }
    }
    static async updateMemberCount(id, count) {
        try {
            const community = await this.getById(id);
            if (!community) {
                throw new Error('Community not found');
            }
            return await this.update(id, {
                stats: {
                    ...community.stats,
                    memberCount: count
                }
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating member count for community ${id}:`, error);
            throw new Error('Failed to update community member count');
        }
    }
    static async searchByName(query, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const searchQuery = {
                selector: {
                    type: this.TYPE,
                    name: {
                        $regex: `(?i)${query}`
                    }
                },
                sort: [{ createdAt: "desc" }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(searchQuery);
        }
        catch (error) {
            logger_1.default.error(`Error searching communities with query "${query}":`, error);
            throw new Error('Failed to search communities');
        }
    }
    static async addTopic(id, topic) {
        try {
            const community = await this.getById(id);
            if (!community) {
                throw new Error('Community not found');
            }
            const updatedTags = [...new Set([...community.tags, topic])];
            return await this.update(id, { tags: updatedTags });
        }
        catch (error) {
            logger_1.default.error(`Error adding topic to community ${id}:`, error);
            throw new Error('Failed to add topic to community');
        }
    }
    static async removeTopic(id, topic) {
        try {
            const community = await this.getById(id);
            if (!community) {
                throw new Error('Community not found');
            }
            const updatedTags = community.tags.filter(t => t !== topic);
            return await this.update(id, { tags: updatedTags });
        }
        catch (error) {
            logger_1.default.error(`Error removing topic from community ${id}:`, error);
            throw new Error('Failed to remove topic from community');
        }
    }
}
exports.CommunityService = CommunityService;
CommunityService.TYPE = 'community';
exports.default = CommunityService;
//# sourceMappingURL=community.service.js.map