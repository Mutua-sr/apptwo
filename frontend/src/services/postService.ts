import axios from 'axios';
import { Post as ApiPost, ApiResponse } from '../types/api';
import { Post, PostInput, PostUpdate, FeedFilters } from '../types/feed';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const transformApiPost = (apiPost: ApiPost): Post => {
  const author = {
    id: apiPost.author.id,
    username: apiPost.author.name,
    avatar: apiPost.author.avatar
  };

  return {
    id: apiPost._id,
    content: apiPost.content,
    author: author,
    tags: apiPost.tags || [],
    likes: apiPost.likedBy?.length || 0,
    comments: apiPost.comments?.map((comment: ApiPost['comments'][0]) => ({
      id: comment._id,
      content: comment.content,
      author: {
        id: comment.author.id,
        username: comment.author.name,
        avatar: comment.author.avatar
      },
      likes: comment.likes,
      timestamp: comment.createdAt
    })) || [],
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt || apiPost.createdAt,
    likedBy: apiPost.likedBy || [],
    sharedTo: apiPost.sharedTo
  };
};

const postService = {
  getPosts: async (filters?: FeedFilters): Promise<Post[]> => {
    try {
      const response = await axios.get<ApiResponse<ApiPost[]>>(`${API_BASE_URL}/posts`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data.map(transformApiPost);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getPost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.get<ApiResponse<ApiPost>>(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  createPost: async (data: PostInput): Promise<Post> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const postData = {
        type: 'post',
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        status: 'published',
        visibility: 'public'
      };

      const response = await axios.post<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts`, 
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (postId: string, data: PostUpdate): Promise<Post> => {
    try {
      const response = await axios.put<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}`, 
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  likePost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  unlikePost: async (postId: string): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  addComment: async (postId: string, content: string): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}/comments`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  deleteComment: async (postId: string, commentId: string): Promise<Post> => {
    try {
      const response = await axios.delete<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  sharePost: async (postId: string, destination: NonNullable<Post['sharedTo']>): Promise<Post> => {
    try {
      const response = await axios.post<ApiResponse<ApiPost>>(
        `${API_BASE_URL}/posts/${postId}/share`,
        destination,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return transformApiPost(response.data.data);
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  },

  searchPosts: async (query: string, filters?: FeedFilters): Promise<Post[]> => {
    try {
      const response = await axios.get<ApiResponse<ApiPost[]>>(`${API_BASE_URL}/posts/search`, {
        params: { query, ...filters },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data.map(transformApiPost);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }
};

export default postService;