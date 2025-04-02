import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';
import { Post, UpdatePost, Comment } from '../types/feed';
import { Community } from '../types/community';
import logger from '../config/logger';

type AuthenticatedRequest = Request & AuthRequest;

export const getPosts = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post[]>>,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await DatabaseService.find<Post>({
      selector: {
        type: 'post',
        createdAt: { $gt: null }
      },
      skip,
      limit: Number(limit),
      sort: [{ createdAt: 'desc' }],
      use_index: 'posts-by-date-index'
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Validate required fields
    if (!req.body.title?.trim()) {
      throw new ApiError('Title is required', 400);
    }
    if (!req.body.content?.trim()) {
      throw new ApiError('Content is required', 400);
    }

    // Validate status
    const status = req.body.status === 'draft' ? 'draft' : 'published';
    const visibility = req.body.visibility || 'public';

    const postData: Omit<Post, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'post',
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      tags: Array.isArray(req.body.tags) ? req.body.tags.filter(Boolean) : [],
      author: {
        id: req.user.id,
        username: req.user.name,
        avatar: req.user.avatar
      },
      imageUrl: req.body.imageUrl,
      status,
      visibility: visibility as 'public' | 'private' | 'shared',
      likes: 0,
      comments: [],
      likedBy: []
    };

    // Create post
    const post = await DatabaseService.create<Post>(postData);

    // Log the creation
    logger.info(`Post created: ${post._id} by user ${req.user.id}`);

    // Notify followers or relevant users about the new post
    RealtimeService.getInstance().broadcastToRoom('feed', 'new_post', post);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Error creating post:', error);
    next(error);
  }
};

export const updatePost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    if (post.author.id !== req.user?.id) {
      throw new ApiError('Not authorized to update this post', 403);
    }

    // Validate status if provided
    const status = req.body.status === 'draft' ? 'draft' : 'published';
    const visibility = req.body.visibility || post.visibility;

    const updateData: UpdatePost = {
      ...(req.body.title && { title: req.body.title.trim() }),
      ...(req.body.content && { content: req.body.content.trim() }),
      ...(req.body.tags && { tags: req.body.tags }),
      ...(req.body.sharedTo && { sharedTo: req.body.sharedTo }),
      ...(req.body.status && { status }),
      ...(req.body.visibility && { visibility: visibility as 'public' | 'private' | 'shared' }),
      ...(req.body.imageUrl && { imageUrl: req.body.imageUrl })
    };

    const updatedPost = await DatabaseService.update<Post>(id, updateData);

    // Notify about post update
    RealtimeService.getInstance().broadcastToRoom('feed', 'post_updated', updatedPost);

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ message: string }>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    if (post.author.id !== req.user?.id) {
      throw new ApiError('Not authorized to delete this post', 403);
    }

    await DatabaseService.delete(id);

    // Notify about post deletion
    RealtimeService.getInstance().broadcastToRoom('feed', 'post_deleted', { id });

    res.json({
      success: true,
      data: { message: 'Post deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Check if user already liked the post
    if (post.likedBy.includes(req.user.id)) {
      throw new ApiError('Post already liked', 400);
    }

    const updatedPost = await DatabaseService.update<Post>(id, {
      likes: post.likes + 1,
      likedBy: [...post.likedBy, req.user.id]
    });

    // Notify about post like
    RealtimeService.getInstance().broadcastToRoom('feed', 'post_liked', {
      postId: id,
      userId: req.user.id,
      likes: updatedPost.likes
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Check if user hasn't liked the post
    if (!post.likedBy.includes(req.user.id)) {
      throw new ApiError('Post not liked', 400);
    }

    const updatedPost = await DatabaseService.update<Post>(id, {
      likes: Math.max(0, post.likes - 1),
      likedBy: post.likedBy.filter(userId => userId !== req.user?.id)
    });

    // Notify about post unlike
    RealtimeService.getInstance().broadcastToRoom('feed', 'post_unliked', {
      postId: id,
      userId: req.user.id,
      likes: updatedPost.likes
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: req.user.name,
      avatar: req.user.avatar,
      content: req.body.content,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    const updatedPost = await DatabaseService.update<Post>(id, {
      comments: [...post.comments, comment]
    });

    // Notify about new comment
    RealtimeService.getInstance().broadcastToRoom('feed', 'new_comment', {
      postId: id,
      comment
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Post>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { targetId } = req.body;

    const post = await DatabaseService.read<Post>(id);
    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    // Verify community exists
    const community = await DatabaseService.read<Community>(targetId);
    if (!community) {
      throw new ApiError('Community not found', 404);
    }

    const updatedPost = await DatabaseService.update<Post>(id, {
      sharedTo: {
        type: 'community',
        id: targetId,
        name: community.name
      }
    });

    // Notify about post share
    RealtimeService.getInstance().broadcastToRoom(targetId, 'post_shared', {
      post: updatedPost,
      sharedBy: req.user?.id
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};