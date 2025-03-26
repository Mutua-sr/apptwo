import { Post, PostInput, PostUpdate, Comment } from '../types/feed';
import { feedService } from './apiService';

const normalizePost = (post: Partial<Post>): Post => ({
  id: post.id!,
  title: post.title!,
  content: post.content!,
  author: post.author!,
  tags: post.tags || [],
  likes: post.likes || 0,
  comments: post.comments || [],
  createdAt: post.createdAt!,
  updatedAt: post.updatedAt!,
  likedBy: post.likedBy || [],
  ...(post.sharedTo && { sharedTo: post.sharedTo })
});

export const DatabaseService = {
  // Get posts with pagination
  async getPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const posts = await feedService.getPosts(page, limit);
      return posts.map(normalizePost);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts. Please try again later.');
    }
  },

  // Create a new post
  async createPost(postInput: PostInput): Promise<Post> {
    try {
      const post = await feedService.createPost(postInput);
      return normalizePost(post);
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post. Please try again later.');
    }
  },

  // Update a post
  async updatePost(id: string, update: PostUpdate): Promise<Post> {
    try {
      const post = await feedService.updatePost(id, update);
      return normalizePost(post);
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post. Please try again later.');
    }
  },

  // Delete a post
  async deletePost(id: string): Promise<boolean> {
    try {
      return await feedService.deletePost(id);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post. Please try again later.');
    }
  },

  // Like a post
  async likePost(id: string): Promise<Post> {
    try {
      const post = await feedService.likePost(id);
      return normalizePost(post);
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Failed to like post. Please try again later.');
    }
  },

  // Unlike a post
  async unlikePost(id: string): Promise<Post> {
    try {
      const post = await feedService.unlikePost(id);
      return normalizePost(post);
    } catch (error) {
      console.error('Error unliking post:', error);
      throw new Error('Failed to unlike post. Please try again later.');
    }
  },

  // Add a comment to a post
  async addComment(postId: string, comment: Omit<Comment, 'id' | 'likes'>): Promise<Post> {
    try {
      const newComment: Comment = {
        ...comment,
        id: `comment_${Date.now()}`,
        likes: 0
      };

      return await this.updatePost(postId, {
        comments: [newComment] // The backend will append this to existing comments
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment. Please try again later.');
    }
  },

  // Share a post
  async sharePost(postId: string, destination: NonNullable<Post['sharedTo']>): Promise<Post> {
    try {
      return await this.updatePost(postId, {
        sharedTo: destination
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      throw new Error('Failed to share post. Please try again later.');
    }
  }
};

export default DatabaseService;