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
class RealtimeService {
    constructor(server) {
        this.userSockets = new Map(); // userId -> Set of socketIds
        this.userStatuses = new Map(); // userId -> UserStatus
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
            // WebRTC Signaling Events
            socket.on('signaling', (data) => this.handleSignaling(socket, data));
            socket.on('disconnect', () => this.handleDisconnect(socket, userId));
        });
    }
    getUserIdFromSocket(socket) {
        var _a;
        try {
            // Get auth token from socket handshake
            const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
            if (!token) {
                logger_1.default.warn(`No auth token provided for socket ${socket.id}`);
                return null;
            }
            // This is a placeholder - implement actual JWT verification
            return 'user-id';
        }
        catch (error) {
            logger_1.default.error('Invalid socket authentication:', error);
            return null;
        }
    }
    handleUserConnection(socket, userId) {
        var _a;
        // Add socket to user's set of sockets
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        (_a = this.userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.add(socket.id);
        // Update user status
        const status = {
            userId,
            presence: realtime_1.UserPresence.ONLINE,
            lastSeen: new Date().toISOString(),
            isTyping: false,
            inCall: false
        };
        this.userStatuses.set(userId, status);
        // Broadcast user's online status
        this.io.emit('user_status', status);
    }
    async handleMessage(socket, message) {
        try {
            // Save message to database
            const savedMessage = await database_1.DatabaseService.create(message);
            // Broadcast message to room
            this.io.to(message.roomId).emit('message', savedMessage);
            logger_1.default.info(`Message sent in room ${message.roomId}`);
        }
        catch (error) {
            logger_1.default.error('Error handling message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
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
        socket.to(roomId).emit('typing_indicator', { userId, status });
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
        // Remove socket from user's set of sockets
        (_a = this.userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.delete(socket.id);
        // If user has no more active sockets update their status to offline
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
    // Public methods for external use
    getUserStatus(userId) {
        return this.userStatuses.get(userId);
    }
}
exports.RealtimeService = RealtimeService;
exports.default = RealtimeService;
//# sourceMappingURL=realtime.service.js.map