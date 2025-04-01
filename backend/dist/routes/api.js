"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const videoController = __importStar(require("../controllers/video.controller"));
const authController = __importStar(require("../controllers/auth.controller"));
const classroomController = __importStar(require("../controllers/classroom.controller"));
const feedController = __importStar(require("../controllers/feed.controller"));
const communityController = __importStar(require("../controllers/community.controller"));
const chatController = __importStar(require("../controllers/chat.controller"));
const profileController = __importStar(require("../controllers/profile.controller"));
const report_routes_1 = __importDefault(require("./report.routes"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
// Profile routes
router.get('/profile/:id', auth_1.auth, profileController.getProfile);
router.put('/profile/:id', auth_1.auth, profileController.updateProfile);
router.post('/profile/media', auth_1.auth, upload.single('file'), profileController.uploadMedia);
router.get('/profile/:id/activities', auth_1.auth, profileController.getActivities);
router.get('/profile/notifications', auth_1.auth, profileController.getNotifications);
router.put('/profile/notifications/:notificationId/read', auth_1.auth, profileController.markNotificationRead);
router.put('/profile/notifications/read-all', auth_1.auth, profileController.markAllNotificationsRead);
// Classroom routes
router.get('/classrooms', auth_1.auth, classroomController.getClassrooms);
router.post('/classrooms', auth_1.auth, classroomController.createClassroom);
router.get('/classrooms/:id', auth_1.auth, classroomController.getClassroom);
router.put('/classrooms/:id', auth_1.auth, classroomController.updateClassroom);
router.delete('/classrooms/:id', auth_1.auth, classroomController.deleteClassroom);
router.post('/classrooms/join', auth_1.auth, classroomController.joinClassroom);
router.post('/classrooms/:id/assignments', auth_1.auth, classroomController.addAssignment);
router.post('/classrooms/:id/materials', auth_1.auth, classroomController.addMaterial);
router.post('/classrooms/:id/schedule', auth_1.auth, classroomController.addScheduleEvent);
router.post('/classrooms/:classroomId/assignments/:assignmentId/submit', auth_1.auth, classroomController.submitAssignment);
router.put('/classrooms/:classroomId/assignments/:assignmentId/submissions/:studentId/grade', auth_1.auth, classroomController.gradeSubmission);
// Feed routes
router.get('/feed', auth_1.auth, feedController.getPosts);
router.post('/feed/posts', auth_1.auth, feedController.createPost);
router.get('/feed/posts/:id', auth_1.auth, feedController.getPost);
router.put('/feed/posts/:id', auth_1.auth, feedController.updatePost);
router.delete('/feed/posts/:id', auth_1.auth, feedController.deletePost);
router.post('/feed/posts/:id/like', auth_1.auth, feedController.likePost);
router.delete('/feed/posts/:id/like', auth_1.auth, feedController.unlikePost);
router.post('/feed/posts/:id/comments', auth_1.auth, feedController.addComment);
router.post('/feed/posts/:id/share', auth_1.auth, feedController.sharePost);
// Community routes
router.get('/communities', auth_1.auth, communityController.getCommunities);
router.post('/communities', auth_1.auth, communityController.createCommunity);
router.get('/communities/:id', auth_1.auth, communityController.getCommunity);
router.put('/communities/:id', auth_1.auth, communityController.updateCommunity);
router.delete('/communities/:id', auth_1.auth, communityController.deleteCommunity);
router.post('/communities/:id/join', auth_1.auth, communityController.joinCommunity);
router.post('/communities/:id/leave', auth_1.auth, communityController.leaveCommunity);
// Chat routes
router.get('/chat/rooms/:roomId/messages', auth_1.auth, chatController.getChatHistory);
router.post('/chat/rooms/:roomId/messages', auth_1.auth, chatController.sendMessage);
router.delete('/chat/messages/:messageId', auth_1.auth, chatController.deleteMessage);
// Video call routes
router.post('/video/call', auth_1.auth, videoController.createSession);
router.get('/video/call/:sessionId', auth_1.auth, videoController.getSession);
router.put('/video/call/:sessionId/status', auth_1.auth, videoController.updateSessionStatus);
router.put('/video/call/:sessionId/end', auth_1.auth, videoController.endSession);
// Report routes (admin only)
router.use('/reports', report_routes_1.default);
// Health check
router.get('/health', (_, res) => res.json({ status: 'ok' }));
exports.default = router;
//# sourceMappingURL=api.js.map