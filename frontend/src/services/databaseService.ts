import { Post as ApiPost, ApiResponse } from '../types/api';
import { Post } from '../types/feed';

export const transformApiPost = (apiPost: ApiPost): Post => {
  return {
    id: apiPost._id,
    content: apiPost.content,
    author: {
      id: apiPost.createdBy,
      username: apiPost.author.name,
      avatar: apiPost.author.avatar
    },
    tags: apiPost.tags || [],
    likes: apiPost.likes,  // Now directly using the number
    comments: apiPost.comments?.map(comment => ({
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

export const transformPostToApi = (post: Post): Partial<ApiPost> => {
  return {
    content: post.content,
    tags: post.tags,
    likedBy: post.likedBy,
    sharedTo: post.sharedTo
  };
};
