"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const socket_io_1 = require("socket.io");
const realtime_1 = require("../types/realtime");
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
require("dotenv/config");
class RealtimeService {
    constructor(server) {
        this.userSockets = new Map(); // userId -> Set of socketIds
        this.userStatuses = new Map(); // userId -> UserStatus
        this.messageTrackers = new Map(); // roomId -> userId -> MessageTracker
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.setupSocketHandlers();
    }
    static initialize(server) {
        if (!RealtimeService.instance) {
            RealtimeService.instance = new RealtimeService(server);
        }
        return RealtimeService.instance;
    }
    static getInstance() {
        if (!RealtimeService.instance) {
            throw new Error('RealtimeService must be initialized with a server first');
        }
        return RealtimeService.instance;
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            const userId = this.getUserIdFromSocket(socket);
            if (!userId) {
                socket.disconnect();
                return;
            }
            this.handleUserConnection(socket, userId);
            // Chat Events
            socket.on('join_room', (roomId) => this.handleJoinRoom(socket, roomId));
            socket.on('leave_room', (roomId) => this.handleLeaveRoom(socket, roomId));
            socket.on('message', (message) => this.handleMessage(socket, message));
            socket.on('typing_start', (roomId) => this.handleTyping(socket, roomId, realtime_1.TypingStatus.STARTED));
            socket.on('typing_stop', (roomId) => this.handleTyping(socket, roomId, realtime_1.TypingStatus.STOPPED));
            socket.on('mark_read', (data) => this.handleMarkRead(socket, data.roomId));
            // WebRTC Signaling Events
            socket.on('signaling', (data) => this.handleSignaling(socket, data));
            socket.on('disconnect', () => this.handleDisconnect(socket, userId));
        });
    }
    getUserIdFromSocket(socket) {
        var _a;
        try {
            const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
            if (!token) {
                logger_1.default.warn(`No auth token provided for socket ${socket.id}`);
                return null;
            }
            return 'user-id'; // Replace with actual JWT verification
        }
        catch (error) {
            logger_1.default.error('Invalid socket authentication:', error);
            return null;
        }
    }
    handleUserConnection(socket, userId) {
        var _a;
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        (_a = this.userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.add(socket.id);
        const status = {
            userId,
            presence: realtime_1.UserPresence.ONLINE,
            lastSeen: new Date().toISOString(),
            isTyping: false,
            inCall: false
        };
        this.userStatuses.set(userId, status);
        this.io.emit('user_status', status);
    }
    async handleMessage(socket, message) {
        try {
            const savedMessage = await database_1.DatabaseService.create({
                type: 'message',
                content: message.content,
                roomId: message.roomId,
                senderId: message.senderId,
                senderName: message.senderName,
                senderAvatar: message.senderAvatar,
                timestamp: new Date().toISOString(),
                attachments: message.attachments,
                reactions: message.reactions,
                replyTo: message.replyTo,
                isEdited: message.isEdited,
                editedAt: message.editedAt,
                isDeleted: message.isDeleted,
                deletedAt: message.deletedAt
            });
            this.io.to(message.roomId).emit('message', savedMessage);
            // Update unread counts for all users in the room except sender
            const roomUsers = await this.getRoomUsers(message.roomId);
            roomUsers.forEach(userId => {
                if (userId !== message.senderId) {
                    this.incrementUnreadCount(message.roomId, userId);
                }
            });
            logger_1.default.info(`Message sent in room ${message.roomId}`);
        }
        catch (error) {
            logger_1.default.error('Error handling message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }
    async getRoomUsers(roomId) {
        const room = this.io.sockets.adapter.rooms.get(roomId);
        if (!room)
            return [];
        const userIds = new Set();
        for (const socketId of room) {
            const socket = this.io.sockets.sockets.get(socketId);
            const userId = socket ? this.getUserIdFromSocket(socket) : null;
            if (userId)
                userIds.add(userId);
        }
        return Array.from(userIds);
    }
    incrementUnreadCount(roomId, userId) {
        if (!this.messageTrackers.has(roomId)) {
            this.messageTrackers.set(roomId, new Map());
        }
        const roomTrackers = this.messageTrackers.get(roomId);
        const tracker = roomTrackers.get(userId) || {
            roomId,
            userId,
            unreadCount: 0,
            lastReadTimestamp: new Date().toISOString()
        };
        tracker.unreadCount++;
        roomTrackers.set(userId, tracker);
        // Notify user about unread count update
        this.emitToUser(userId, 'unread_count_update', {
            roomId,
            unreadCount: tracker.unreadCount
        });
    }
    handleMarkRead(socket, roomId) {
        const userId = this.getUserIdFromSocket(socket);
        if (!userId)
            return;
        const roomTrackers = this.messageTrackers.get(roomId);
        if (roomTrackers) {
            roomTrackers.set(userId, {
                roomId,
                userId,
                unreadCount: 0,
                lastReadTimestamp: new Date().toISOString()
            });
            // Notify user about reset unread count
            this.emitToUser(userId, 'unread_count_update', {
                roomId,
                unreadCount: 0
            });
        }
    }
    async getUnreadCount(roomId, userId) {
        var _a;
        const roomTrackers = this.messageTrackers.get(roomId);
        return ((_a = roomTrackers === null || roomTrackers === void 0 ? void 0 : roomTrackers.get(userId)) === null || _a === void 0 ? void 0 : _a.unreadCount) || 0;
    }
    handleTyping(socket, roomId, status) {
        const userId = this.getUserIdFromSocket(socket);
        if (!userId)
            return;
        const userStatus = this.userStatuses.get(userId);
        if (userStatus) {
            userStatus.isTyping = status === realtime_1.TypingStatus.STARTED;
            this.userStatuses.set(userId, userStatus);
        }
        socket.to(roomId).emit('typing_indicator', { userId, roomId, status });
    }
    handleSignaling(socket, data) {
        const { targetUserId } = data;
        this.emitToUser(targetUserId, 'signaling', {
            ...data,
            userId: this.getUserIdFromSocket(socket)
        });
    }
    handleJoinRoom(socket, roomId) {
        socket.join(roomId);
        logger_1.default.info(`Socket ${socket.id} joined room ${roomId}`);
    }
    handleLeaveRoom(socket, roomId) {
        socket.leave(roomId);
        logger_1.default.info(`Socket ${socket.id} left room ${roomId}`);
    }
    handleDisconnect(socket, userId) {
        var _a, _b;
        (_a = this.userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.delete(socket.id);
        if (((_b = this.userSockets.get(userId)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
            const status = {
                userId,
                presence: realtime_1.UserPresence.OFFLINE,
                lastSeen: new Date().toISOString(),
                isTyping: false,
                inCall: false
            };
            this.userStatuses.set(userId, status);
            this.io.emit('user_status', status);
        }
    }
    emitToUser(userId, event, data) {
        const userSocketIds = this.userSockets.get(userId);
        if (userSocketIds) {
            userSocketIds.forEach(socketId => {
                this.io.to(socketId).emit(event, data);
            });
        }
    }
    broadcastToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
    getUserStatus(userId) {
        return this.userStatuses.get(userId);
    }
}
exports.RealtimeService = RealtimeService;
exports.default = RealtimeService;
//# sourceMappingURL=realtime.service.js.map