import logger from '../config/logger';
import DatabaseService from '../services/database';
import { Community, CreateCommunity } from '../types/community';
import { Post, CreatePost } from '../types/feed';
import { DatabaseQuery } from '../types/database';

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
        const query: DatabaseQuery = {
          selector: {
            type: 'community'
          },
          skip,
          limit: limit || 10,
          sort: [{ createdAt: 'desc' }]
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
        const query: DatabaseQuery = {
          selector: {
            type: 'post'
          },
          skip,
          limit: limit || 10,
          sort: [{ createdAt: 'desc' }]
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
    createCommunity: async (_: any, { input }: { input: Partial<CreateCommunity> }) => {
      try {
        const communityData: Omit<Community, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
          type: 'community',
          name: input.name || '',
          description: input.description || '',
          creator: input.creator!,
          members: [],
          settings: {
            isPrivate: input.settings?.isPrivate ?? false,
            requiresApproval: input.settings?.requiresApproval ?? false,
            allowPosts: input.settings?.allowPosts ?? true,
            allowEvents: input.settings?.allowEvents ?? true,
            allowPolls: input.settings?.allowPolls ?? true
          },
          stats: {
            memberCount: 1, // Creator is first member
            postCount: 0,
            activeMembers: 1
          },
          tags: input.tags || []
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
    createPost: async (_: any, { input }: { input: CreatePost }) => {
      try {
        const postData: Omit<Post, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
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