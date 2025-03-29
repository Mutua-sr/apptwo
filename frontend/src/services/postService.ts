import axios from 'axios';
import { Post as ApiPost, ApiResponse, Comment as ApiComment } from '../types/api';
import { Post, PostInput, PostUpdate, Comment, User } from '../types/feed';

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
const transformApiPost = (apiPost: ApiPost): Post => {
  const author: User = {
    id: apiPost.createdBy,
    username: apiPost.createdBy // Note: This should be replaced with actual username when available
  };

  return {
    id: apiPost._id,
    title: apiPost.title,
    content: apiPost.content,
    author,
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

// Transform Frontend Post to API Post
const transformToApiPost = (post: PostInput): Partial<ApiPost> => ({
  title: post.title,
  content: post.content,
  tags: post.tags,
  type: 'post'
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
      const apiPost = transformToApiPost(data);
      const response = await api.post<ApiResponse<ApiPost>>('/feed/posts', apiPost);
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get a single post
  getPost: async (postId: string): Promise<Post> => {
    try {
      const response = await api.get<ApiResponse<ApiPost>>(`/feed/posts/${postId}`);
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Get all posts with pagination
  getPosts: async (page: number = 1, limit: number = 10): Promise<Post[]> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<ApiResponse<ApiPost[]>>(`/feed/posts?${params.toString()}`);
      return response.data.data.map(transformApiPost);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Update a post
  updatePost: async (postId: string, data: PostUpdate): Promise<Post> => {
    try {
      const response = await api.put<ApiResponse<ApiPost>>(`/feed/posts/${postId}`, data);
      return transformApiPost(response.data.data);
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
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Unlike a post
  unlikePost: async (postId: string): Promise<Post> => {
    try {
      const response = await api.delete<ApiResponse<ApiPost>>(`/feed/posts/${postId}/like`);
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<ApiPost>>(`/feed/posts/${postId}/comments`, comment);
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Share a post
  sharePost: async (postId: string, destination: NonNullable<Post['sharedTo']>): Promise<Post> => {
    try {
      const response = await api.post<ApiResponse<ApiPost>>(`/feed/posts/${postId}/share`, destination);
      return transformApiPost(response.data.data);
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Post Search & Discovery
   */

  // Search posts
  searchPosts: async (query: string, page: number = 1, limit: number = 10): Promise<Post[]> => {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<ApiResponse<ApiPost[]>>(`/feed/posts/search?${params.toString()}`);
      return response.data.data.map(transformApiPost);
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
      return response.data.data.map(transformApiPost);
    } catch (error) {
      throw handleError(error);
    }
  }
};

export default postService;