import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { Post, CreatePost, UpdatePost, Comment } from '../types/feed';
import { Classroom } from '../types/classroom';
import { Community } from '../types/community';

export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await DatabaseService.find<Post>({
      selector: {
        type: 'post'
      },
      skip,
      limit: Number(limit),
      sort: [{ createdAt: 'desc' }]
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
  req: AuthRequest,
  res: Response,
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const postData: CreatePost = {
      type: 'post',
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      author: {
        id: req.user.id,
        username: req.user.name,
        avatar: req.user.avatar
      }
    };

    const post = await DatabaseService.create<Post>({
      ...postData,
      likes: 0,
      comments: [],
      likedBy: []
    });

    // Notify followers or relevant users about the new post
    RealtimeService.getInstance().broadcastToRoom('feed', 'new_post', post);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: AuthRequest,
  res: Response,
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

    const updateData: UpdatePost = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.content && { content: req.body.content }),
      ...(req.body.tags && { tags: req.body.tags }),
      ...(req.body.sharedTo && { sharedTo: req.body.sharedTo })
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
  req: AuthRequest,
  res: Response,
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
  req: AuthRequest,
  res: Response,
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
  req: AuthRequest,
  res: Response,
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
  req: AuthRequest,
  res: Response,
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type, targetId } = req.body;

    const post = await DatabaseService.read<Post>(id);
    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    // Verify target exists and has correct type
    const target = await DatabaseService.read<Classroom | Community>(targetId);
    if (!target) {
      throw new ApiError(`${type} not found`, 404);
    }

    // Verify the target type matches the requested type
    if (target.type !== type) {
      throw new ApiError(`Invalid ${type} ID`, 400);
    }

    const updatedPost = await DatabaseService.update<Post>(id, {
      sharedTo: {
        type,
        id: targetId,
        name: target.name
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