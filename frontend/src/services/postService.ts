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

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status
      });
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    return Promise.reject(error);
  }
);

// Transform API Post to Frontend Post
// Transform API Post to Frontend Post
const transformResponse = (apiPost: ApiPost): Post => ({
  id: apiPost._id,
  title: apiPost.title,
  content: apiPost.content,
  author: {
    id: apiPost.createdBy,
    username: apiPost.createdBy
  },
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
});

const transformRequest = (post: Post): Omit<ApiPost, '_id' | 'type' | 'createdBy'> => ({
  title: post.title,
  content: post.content,
  tags: post.tags,
  likes: post.likes,
  comments: post.comments,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  likedBy: post.likedBy,
  ...(post.sharedTo && { sharedTo: post.sharedTo })
});

// Error handling helper
const handleError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message;
    if (typeof errorMessage === 'object') {
      return new Error(JSON.stringify(errorMessage));
    }
    return new Error(errorMessage);
  }
  return error instanceof Error ? error : new Error(String(error));
};

export const postService = {
  /**
   * Post Management
   */

  // Create a new post
  createPost: async (data: PostInput): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<any>>('/feed/posts', {
        ...data,
        type: 'post'
      });
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

  // Get all posts with pagination
  getPosts: async ({ userId, page = 1, limit = 10 }: { userId?: string; page: number; limit: number }): Promise<Post[]> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await api.get<ApiResponse<any[]>>(`/feed/posts?${params.toString()}`);
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a post
  updatePost: async (postId: string, data: PostUpdate): Promise<Post> => {
    try {
      const response = await api.put<ApiResponse<ApiPost>>(`/feed/posts/${postId}`, {
        ...data,
        type: 'post'
      });
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

  /**
   * Post Interactions
   */

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

  // Add a comment to a post
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

  /**
   * Post Search & Discovery
   */

  // Search posts
  searchPosts: async (query: string, options: QueryOptions = { page: 1, limit: 10 }): Promise<Post[]> => {
    try {
      const params = new URLSearchParams({
        q: query,
        page: options.page?.toString() || '1',
        limit: options.limit?.toString() || '10'
      });

      const response = await api.get<ApiResponse<ApiPost[]>>(`/feed/posts/search?${params.toString()}`);
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get posts by tag
  getPostsByTag: async (tag: string, page: number = 1, limit: number = 10): Promise<Post[]> => {
    try {
      const params = new URLSearchParams({
        tag,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<ApiResponse<ApiPost[]>>(`/feed/posts/tags?${params.toString()}`);
      return response.data.data.map(transformResponse);
    } catch (error) {
      throw handleError(error);
    }
  }
};

export default postService;