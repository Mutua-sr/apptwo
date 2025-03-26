import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, Post, CreatePost } from '../types';

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content, tags, sharedTo } = req.body;

    if (!title || !content) {
      const error = new Error('Title and content are required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (!req.user?.id) {
      const error = new Error('User not authenticated') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const postData: CreatePost = {
      type: 'post',
      title,
      content,
      author: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      tags: tags || [],
      likes: 0,
      comments: [],
      likedBy: [],
      sharedTo
    };

    const post = await DatabaseService.create<Post>(postData);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await DatabaseService.find<Post>({
      selector: {
        type: 'post'
      }
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
      const error = new Error('Post not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
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
    const { title, content, tags } = req.body;

    const post = await DatabaseService.read<Post>(id);

    if (!post) {
      const error = new Error('Post not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (post.author.id !== req.user?.id) {
      const error = new Error('Not authorized to update this post') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    const updatedPost = await DatabaseService.update<Post>(id, {
      title: title || post.title,
      content: content || post.content,
      tags: tags || post.tags
    });

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
      const error = new Error('Post not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (post.author.id !== req.user?.id) {
      const error = new Error('Not authorized to delete this post') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    await DatabaseService.delete(id);

    res.json({
      success: true,
      data: { message: 'Post deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};