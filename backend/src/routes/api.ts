import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as videoController from '../controllers/video.controller';
import * as authController from '../controllers/auth.controller';
import * as classroomController from '../controllers/classroom.controller';
import * as feedController from '../controllers/feed.controller';
import * as communityController from '../controllers/community.controller';
import * as chatController from '../controllers/chat.controller';
import * as profileController from '../controllers/profile.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// Profile routes
router.get('/profile/:id', auth, profileController.getProfile);
router.put('/profile/:id', auth, profileController.updateProfile);
router.post('/profile/media', auth, upload.single('file'), profileController.uploadMedia);
router.get('/profile/:id/activities', auth, profileController.getActivities);
router.get('/profile/notifications', auth, profileController.getNotifications);
router.put('/profile/notifications/:notificationId/read', auth, profileController.markNotificationRead);
router.put('/profile/notifications/read-all', auth, profileController.markAllNotificationsRead);

// Classroom routes
router.get('/classrooms', auth, classroomController.getClassrooms);
router.post('/classrooms', auth, classroomController.createClassroom);
router.get('/classrooms/:id', auth, classroomController.getClassroom);
router.put('/classrooms/:id', auth, classroomController.updateClassroom);
router.delete('/classrooms/:id', auth, classroomController.deleteClassroom);
router.post('/classrooms/join', auth, classroomController.joinClassroom);
router.post('/classrooms/:id/assignments', auth, classroomController.addAssignment);
router.post('/classrooms/:id/materials', auth, classroomController.addMaterial);
router.post('/classrooms/:id/schedule', auth, classroomController.addScheduleEvent);
router.post('/classrooms/:classroomId/assignments/:assignmentId/submit', auth, classroomController.submitAssignment);
router.put('/classrooms/:classroomId/assignments/:assignmentId/submissions/:studentId/grade', auth, classroomController.gradeSubmission);

// Feed routes
router.get('/feed', auth, feedController.getPosts);
router.post('/feed/posts', auth, feedController.createPost);
router.get('/feed/posts/:id', auth, feedController.getPost);
router.put('/feed/posts/:id', auth, feedController.updatePost);
router.delete('/feed/posts/:id', auth, feedController.deletePost);
router.post('/feed/posts/:id/like', auth, feedController.likePost);
router.delete('/feed/posts/:id/like', auth, feedController.unlikePost);
router.post('/feed/posts/:id/comments', auth, feedController.addComment);
router.post('/feed/posts/:id/share', auth, feedController.sharePost);

// Community routes
router.get('/communities', auth, communityController.getCommunities);
router.post('/communities', auth, communityController.createCommunity);
router.get('/communities/:id', auth, communityController.getCommunity);
router.put('/communities/:id', auth, communityController.updateCommunity);
router.delete('/communities/:id', auth, communityController.deleteCommunity);
router.post('/communities/:id/join', auth, communityController.joinCommunity);
router.post('/communities/:id/leave', auth, communityController.leaveCommunity);

// Chat routes
router.get('/chat/rooms/:roomId/messages', auth, chatController.getChatHistory);
router.post('/chat/rooms/:roomId/messages', auth, chatController.sendMessage);
router.delete('/chat/messages/:messageId', auth, chatController.deleteMessage);

// Video call routes
router.post('/video/call', auth, videoController.createSession);
router.get('/video/call/:sessionId', auth, videoController.getSession);
router.put('/video/call/:sessionId/status', auth, videoController.updateSessionStatus);
router.put('/video/call/:sessionId/end', auth, videoController.endSession);

// Health check
router.get('/health', (_, res) => res.json({ status: 'ok' }));

export default router;
