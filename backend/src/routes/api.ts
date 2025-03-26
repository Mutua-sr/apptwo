import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { 
  createClassroom,
  getClassrooms,
  getClassroom,
  updateClassroom,
  deleteClassroom
} from '../controllers/classroom.controller';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
} from '../controllers/post.controller';
import {
  createCommunity,
  getCommunities,
  getCommunity,
  updateCommunity,
  deleteCommunity
} from '../controllers/community.controller';
import {
  getChatHistory,
  sendMessage,
  deleteMessage
} from '../controllers/chat.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/login', login);
router.post('/auth/register', register);

// Classroom routes
router.post('/classrooms', auth, createClassroom);
router.get('/classrooms', auth, getClassrooms);
router.get('/classrooms/:id', auth, getClassroom);
router.put('/classrooms/:id', auth, updateClassroom);
router.delete('/classrooms/:id', auth, deleteClassroom);

// Post routes
router.post('/posts', auth, createPost);
router.get('/posts', auth, getPosts);
router.get('/posts/:id', auth, getPost);
router.put('/posts/:id', auth, updatePost);
router.delete('/posts/:id', auth, deletePost);

// Community routes
router.post('/communities', auth, createCommunity);
router.get('/communities', auth, getCommunities);
router.get('/communities/:id', auth, getCommunity);
router.put('/communities/:id', auth, updateCommunity);
router.delete('/communities/:id', auth, deleteCommunity);

// Chat routes
router.get('/chat/:roomId/messages', auth, getChatHistory);
router.post('/chat/:roomId/messages', auth, sendMessage);
router.delete('/chat/messages/:messageId', auth, deleteMessage);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;