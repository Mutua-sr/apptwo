"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../config/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                socket.data.user = decoded;
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            logger_1.default.info(`Socket connected: ${socket.id}`);
            socket.on('join_room', (roomId) => {
                socket.join(roomId);
                logger_1.default.info(`Socket ${socket.id} joined room ${roomId}`);
            });
            socket.on('leave_room', (roomId) => {
                socket.leave(roomId);
                logger_1.default.info(`Socket ${socket.id} left room ${roomId}`);
            });
            socket.on('message', (message) => {
                this.io.to(message.roomId).emit('message', {
                    ...message,
                    senderId: socket.data.user.id,
                    senderName: socket.data.user.name,
                    senderAvatar: socket.data.user.avatar
                });
            });
            socket.on('disconnect', () => {
                logger_1.default.info(`Socket disconnected: ${socket.id}`);
            });
        });
    }
    static initialize(server) {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(server);
        }
        return SocketService.instance;
    }
    static getInstance() {
        if (!SocketService.instance) {
            throw new Error('Socket service not initialized');
        }
        return SocketService.instance;
    }
    emitToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
}
exports.SocketService = SocketService;
exports.default = SocketService;
//# sourceMappingURL=socket.service.js.map