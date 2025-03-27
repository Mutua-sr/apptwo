import { Community, CreateCommunity, UpdateCommunity } from '../types';
import { DatabaseService } from './database';
import logger from '../config/logger';

export class CommunityService {
  private static readonly TYPE = 'community';

  static async create(input: CreateCommunity): Promise<Community> {
    try {
      const now = new Date().toISOString();
      const community: Omit<Community, '_id' | '_rev'> = {
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

      const result = await DatabaseService.create(community);
      return {
        ...community,
        _id: result._id,
        _rev: result._rev
      } as Community;
    } catch (error) {
      logger.error('Error creating community:', error);
      throw new Error('Failed to create community');
    }
  }

  static async getById(id: string): Promise<Community | null> {
    try {
      const community = await DatabaseService.read<Community>(id);
      return community;
    } catch (error) {
      logger.error(`Error getting community ${id}:`, error);
      throw new Error('Failed to get community');
    }
  }

  static async list(page: number = 1, limit: number = 10): Promise<Community[]> {
    try {
      const skip = (page - 1) * limit;
      const query = {
        selector: {
          type: this.TYPE
        },
        sort: [{ createdAt: "desc" as "desc" }],
        skip,
        limit
      };

      return await DatabaseService.find<Community>(query);
    } catch (error) {
      logger.error('Error listing communities:', error);
      throw new Error('Failed to list communities');
    }
  }

  static async update(id: string, data: UpdateCommunity): Promise<Community> {
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

      const updated = await DatabaseService.update<Community>(id, updateData);
      return updated;
    } catch (error) {
      logger.error(`Error updating community ${id}:`, error);
      throw new Error('Failed to update community');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      return await DatabaseService.delete(id);
    } catch (error) {
      logger.error(`Error deleting community ${id}:`, error);
      throw new Error('Failed to delete community');
    }
  }

  static async getByTopic(topic: string): Promise<Community[]> {
    try {
      const query = {
        selector: {
          type: this.TYPE,
          tags: { $elemMatch: { $eq: topic } }
        },
        sort: [{ createdAt: "desc" as "desc" }]
      };

      return await DatabaseService.find<Community>(query);
    } catch (error) {
      logger.error(`Error getting communities for topic ${topic}:`, error);
      throw new Error('Failed to get communities by topic');
    }
  }

  static async updateMemberCount(id: string, count: number): Promise<Community> {
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
      } as UpdateCommunity);
    } catch (error) {
      logger.error(`Error updating member count for community ${id}:`, error);
      throw new Error('Failed to update community member count');
    }
  }

  static async searchByName(query: string, page: number = 1, limit: number = 10): Promise<Community[]> {
    try {
      const skip = (page - 1) * limit;
      const searchQuery = {
        selector: {
          type: this.TYPE,
          name: {
            $regex: `(?i)${query}`
          }
        },
        sort: [{ createdAt: "desc" as "desc" }],
        skip,
        limit
      };

      return await DatabaseService.find<Community>(searchQuery);
    } catch (error) {
      logger.error(`Error searching communities with query "${query}":`, error);
      throw new Error('Failed to search communities');
    }
  }

  static async addTopic(id: string, topic: string): Promise<Community> {
    try {
      const community = await this.getById(id);
      if (!community) {
        throw new Error('Community not found');
      }

      const updatedTags = [...new Set([...community.tags, topic])];
      return await this.update(id, { tags: updatedTags });
    } catch (error) {
      logger.error(`Error adding topic to community ${id}:`, error);
      throw new Error('Failed to add topic to community');
    }
  }

  static async removeTopic(id: string, topic: string): Promise<Community> {
    try {
      const community = await this.getById(id);
      if (!community) {
        throw new Error('Community not found');
      }

      const updatedTags = community.tags.filter(t => t !== topic);
      return await this.update(id, { tags: updatedTags });
    } catch (error) {
      logger.error(`Error removing topic from community ${id}:`, error);
      throw new Error('Failed to remove topic from community');
    }
  }
}

export default CommunityService;