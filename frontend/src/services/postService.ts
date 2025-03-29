import axios from 'axios';
import { Post as ApiPost, ApiResponse } from '../types/api';
import { Post, PostInput, PostUpdate, QueryOptions } from '../types/feed';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Configure axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Transform API Post to Frontend Post
const transformResponse = (apiPost: ApiPost): Post => {
  // Ensure author data is properly structured
  const author = apiPost.author || {
    id: apiPost.createdBy,
    username: 'Unknown User',
    avatar: undefined
  };

  return {
    id: apiPost._id,
    title: apiPost.title,
    content: apiPost.content,
    author: author,
    tags: apiPost.tags || [],
    likes: apiPost.likes || 0,
    comments: apiPost.comments?.map(comment => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
      likes: comment.likes || 0,
      avatar: comment.avatar
    })) || [],
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt || apiPost.createdAt,
    likedBy: apiPost.likedBy || [],
    ...(apiPost.sharedTo && { sharedTo: apiPost.sharedTo })
  };
};

// Error handling helper
const handleError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data;
    
    if (errorResponse?.message) {
      return new Error(
        typeof errorResponse.message === 'object'
          ? Object.values(errorResponse.message).join('. ')
          : errorResponse.message
      );
    }
    
    return new Error(error.message || 'An error occurred while fetching posts');
  }
  return error instanceof Error ? error : new Error('An unexpected error occurred');
};

export const postService = {
  // Get posts with pagination
  getPosts: async ({ userId, page = 1, limit = 10 }: { userId?: string; page: number; limit: number }): Promise<Post[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/feed', {
        params: {
          page: String(page),
          limit: String(limit)
        }
      });
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Create a new post
  createPost: async (data: PostInput): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<any>>('/feed/posts', data);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get a single post
  getPost: async (postId: string): Promise<Post> => {
    try {
      const response = await api.get<ApiResponse<ApiPost>>(`/feed/posts/${postId}`);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a post
  updatePost: async (postId: string, data: PostUpdate): Promise<Post> => {
    try {
      const response = await api.put<ApiResponse<ApiPost>>(`/feed/posts/${postId}`, data);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Delete a post
  deletePost: async (postId: string): Promise<void> => {
    try {
      await api.delete<ApiResponse<void>>(`/feed/posts/${postId}`);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Like a post
  likePost: async (postId: string): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<ApiPost>>(`/feed/posts/${postId}/like`);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Unlike a post
  unlikePost: async (postId: string): Promise<Post> => {
    try {
      const response = await api.delete<ApiResponse<ApiPost>>(`/feed/posts/${postId}/like`);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Add a comment
  addComment: async (postId: string, comment: { content: string }): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<ApiPost>>(`/feed/posts/${postId}/comments`, comment);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Share a post
  sharePost: async (postId: string, destination: NonNullable<Post['sharedTo']>): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<ApiPost>>(`/feed/posts/${postId}/share`, destination);
      return transformResponse(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Search posts
  searchPosts: async (query: string, options: QueryOptions = { page: 1, limit: 10 }): Promise<Post[]> => {
    try {
      const response = await api.get<ApiResponse<ApiPost[]>>('/feed/posts/search', {
        params: {
          q: query,
          page: String(options.page),
          limit: String(options.limit)
        }
      });
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get posts by tag
  getPostsByTag: async (tag: string, page: number = 1, limit: number = 10): Promise<Post[]> => {
    try {
      const response = await api.get<ApiResponse<ApiPost[]>>('/feed/posts/tags', {
        params: {
          tag,
          page: String(page),
          limit: String(limit)
        }
      });
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  }
};

export default postService;