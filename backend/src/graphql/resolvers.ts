import { Context } from '../types';
import logger from '../config/logger';
import DatabaseService from '../services/database'; // Import DatabaseService
import { Classroom, Community, Post } from '../types'; // Import necessary types

const resolvers = {
  Query: {
    // Classroom queries
    classrooms: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }, context: Context) => {
      try {
        const classrooms = await DatabaseService.list<Classroom>({ limit, skip: (page - 1) * limit });
        return classrooms;
      } catch (error) {
        logger.error('Error fetching classrooms:', error);
        throw new Error('Failed to fetch classrooms');
      }
    },

    classroom: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const classroom = await DatabaseService.read<Classroom>(id);
        return classroom;
      } catch (error) {
        logger.error(`Error fetching classroom ${id}:`, error);
        throw new Error('Failed to fetch classroom');
      }
    },

    // Community queries
    communities: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }, context: Context) => {
      try {
        const communities = await DatabaseService.list<Community>({ limit, skip: (page - 1) * limit });
        return communities;
      } catch (error) {
        logger.error('Error fetching communities:', error);
        throw new Error('Failed to fetch communities');
      }
    },

    community: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const community = await DatabaseService.read<Community>(id);
        return community;
      } catch (error) {
        logger.error(`Error fetching community ${id}:`, error);
        throw new Error('Failed to fetch community');
      }
    },

    // Post queries
    posts: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }, context: Context) => {
      try {
        const posts = await DatabaseService.list<Post>({ limit, skip: (page - 1) * limit });
        return posts;
      } catch (error) {
        logger.error('Error fetching posts:', error);
        throw new Error('Failed to fetch posts');
      }
    },

    post: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        const post = await DatabaseService.read<Post>(id);
        return post;
      } catch (error) {
        logger.error(`Error fetching post ${id}:`, error);
        throw new Error('Failed to fetch post');
      }
    },

    postsByTag: async (_: any, { tag, page = 1, limit = 10 }: { tag: string; page: number; limit: number }, context: Context) => {
      try {
        // TODO: Implement actual database query
        return [];
      } catch (error) {
        logger.error(`Error fetching posts by tag ${tag}:`, error);
        throw new Error('Failed to fetch posts by tag');
      }
    }
  },

  Mutation: {
    // Classroom mutations
    createClassroom: async (_: any, { input }: any, context: Context) => {
      try {
        const newClassroom = await DatabaseService.create<Classroom>(input);
        return newClassroom;
      } catch (error) {
        logger.error('Error creating classroom:', error);
        throw new Error('Failed to create classroom');
      }
    },

    updateClassroom: async (_: any, { id, input }: any, context: Context) => {
      try {
        const updatedClassroom = await DatabaseService.update<Classroom>(id, input);
        return updatedClassroom;
      } catch (error) {
        logger.error(`Error updating classroom ${id}:`, error);
        throw new Error('Failed to update classroom');
      }
    },

    deleteClassroom: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        await DatabaseService.delete(id);
        return true;
      } catch (error) {
        logger.error(`Error deleting classroom ${id}:`, error);
        throw new Error('Failed to delete classroom');
      }
    },

    // Community mutations
    createCommunity: async (_: any, { input }: any, context: Context) => {
      try {
        const newCommunity = await DatabaseService.create<Community>(input);
        return newCommunity;
      } catch (error) {
        logger.error('Error creating community:', error);
        throw new Error('Failed to create community');
      }
    },

    updateCommunity: async (_: any, { id, input }: any, context: Context) => {
      try {
        const updatedCommunity = await DatabaseService.update<Community>(id, input);
        return updatedCommunity;
      } catch (error) {
        logger.error(`Error updating community ${id}:`, error);
        throw new Error('Failed to update community');
      }
    },

    deleteCommunity: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        await DatabaseService.delete(id);
        return true;
      } catch (error) {
        logger.error(`Error deleting community ${id}:`, error);
        throw new Error('Failed to delete community');
      }
    },

    // Post mutations
    createPost: async (_: any, { input }: any, context: Context) => {
      try {
        const newPost = await DatabaseService.create<Post>(input);
        return newPost;
      } catch (error) {
        logger.error('Error creating post:', error);
        throw new Error('Failed to create post');
      }
    },

    updatePost: async (_: any, { id, input }: any, context: Context) => {
      try {
        const updatedPost = await DatabaseService.update<Post>(id, input);
        return updatedPost;
      } catch (error) {
        logger.error(`Error updating post ${id}:`, error);
        throw new Error('Failed to update post');
      }
    },

    deletePost: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        await DatabaseService.delete(id);
        return true;
      } catch (error) {
        logger.error(`Error deleting post ${id}:`, error);
        throw new Error('Failed to delete post');
      }
    }
  }
};

export default resolvers;