import axios from 'axios';
import { 
  Post, 
  CreatePostData, 
  UpdatePostData, 
  Comment, 
  ApiResponse,
  PaginationQuery,
  SearchQuery 
} from '../types/api';

const API_BASE_URL = 'http://localhost:3000/api';

// Add token to requests if it exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const postService = {
  // Create a new post
  createPost: async (data: CreatePostData): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<Post>>(`${API_BASE_URL}/posts`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get a single post
  getPost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.get<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Get all posts or posts by user ID with pagination
  getPosts: async (options?: PaginationQuery & { userId?: string }): Promise<Post[]> => {
    try {
      const params = new URLSearchParams();
      if (options?.userId) params.append('userId', options.userId);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await axios.get<ApiResponse<Post[]>>(`${API_BASE_URL}/posts?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Update a post
  updatePost: async (postId: string, data: UpdatePostData): Promise<Post> => {
    try {
      const response = await axios.put<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId: string): Promise<void> => {
    try {
      await axios.delete<ApiResponse<void>>(`${API_BASE_URL}/posts/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}/like`);
      return response.data.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Unlike a post
  unlikePost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.delete<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}/like`);
      return response.data.data;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}/comments`, comment);
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Share a post
  sharePost: async (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<Post>>(`${API_BASE_URL}/posts/${postId}/share`, destination);
      return response.data.data;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (query: SearchQuery): Promise<Post[]> => {
    try {
      const params = new URLSearchParams();
      params.append('q', query.q);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await axios.get<ApiResponse<Post[]>>(`${API_BASE_URL}/posts/search?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }
};

export default postService;