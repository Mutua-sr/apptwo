import logger from '../config/logger';
import DatabaseService from '../services/database';
import { Community, Post } from '../types';
import { SortOrder } from '../types/database';

const resolvers = {
  Query: {
    // Community queries
    community: async (_: any, { id }: { id: string }) => {
      try {
        return await DatabaseService.read<Community>(id);
      } catch (error) {
        logger.error(`Error in community query: ${error}`);
        throw error;
      }
    },

    communities: async (_: any, { page, limit }: { page?: number; limit?: number }) => {
      try {
        const skip = page ? (page - 1) * (limit || 10) : 0;
        const query = {
          selector: {
            type: 'community'
          },
          skip,
          limit: limit || 10,
          sort: [{ createdAt: 'desc' } as SortOrder]
        };
        return await DatabaseService.find<Community>(query);
      } catch (error) {
        logger.error(`Error in communities query: ${error}`);
        throw error;
      }
    },

    // Post queries
    post: async (_: any, { id }: { id: string }) => {
      try {
        return await DatabaseService.read<Post>(id);
      } catch (error) {
        logger.error(`Error in post query: ${error}`);
        throw error;
      }
    },

    posts: async (_: any, { page, limit }: { page?: number; limit?: number }) => {
      try {
        const skip = page ? (page - 1) * (limit || 10) : 0;
        const query = {
          selector: {
            type: 'post'
          },
          skip,
          limit: limit || 10,
          sort: [{ createdAt: 'desc' } as SortOrder]
        };
        return await DatabaseService.find<Post>(query);
      } catch (error) {
        logger.error(`Error in posts query: ${error}`);
        throw error;
      }
    }
  },

  Mutation: {
    // Community mutations
    createCommunity: async (_: any, { input }: { input: Partial<Community> }) => {
      try {
        const communityData: Omit<Community, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
          type: 'community',
          name: input.name || '',
          description: input.description || '',
          members: input.members || [],
          topics: input.topics || [],
          settings: input.settings || {
            isPrivate: false,
            requiresApproval: false,
            allowInvites: true
          }
        };
        return await DatabaseService.create<Community>(communityData);
      } catch (error) {
        logger.error(`Error in createCommunity mutation: ${error}`);
        throw error;
      }
    },

    updateCommunity: async (_: any, { id, input }: { id: string; input: Partial<Community> }) => {
      try {
        return await DatabaseService.update<Community>(id, input);
      } catch (error) {
        logger.error(`Error in updateCommunity mutation: ${error}`);
        throw error;
      }
    },

    deleteCommunity: async (_: any, { id }: { id: string }) => {
      try {
        await DatabaseService.delete(id);
        return true;
      } catch (error) {
        logger.error(`Error in deleteCommunity mutation: ${error}`);
        throw error;
      }
    },

    // Post mutations
    createPost: async (_: any, { input }: { input: Partial<Post> }) => {
      try {
        const postData: Omit<Post, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
          type: 'post',
          title: input.title || '',
          content: input.content || '',
          author: input.author!,
          tags: input.tags || [],
          likes: 0,
          comments: [],
          likedBy: []
        };
        return await DatabaseService.create<Post>(postData);
      } catch (error) {
        logger.error(`Error in createPost mutation: ${error}`);
        throw error;
      }
    },

    updatePost: async (_: any, { id, input }: { id: string; input: Partial<Post> }) => {
      try {
        return await DatabaseService.update<Post>(id, input);
      } catch (error) {
        logger.error(`Error in updatePost mutation: ${error}`);
        throw error;
      }
    },

    deletePost: async (_: any, { id }: { id: string }) => {
      try {
        await DatabaseService.delete(id);
        return true;
      } catch (error) {
        logger.error(`Error in deletePost mutation: ${error}`);
        throw error;
      }
    }
  }
};

export default resolvers;