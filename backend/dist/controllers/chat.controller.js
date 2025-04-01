"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.sendMessage = exports.getChatHistory = exports.getChatRoom = exports.createChatRoom = exports.getChatRooms = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const getChatRooms = async (req, res, next) => {
    var _a;
    try {
        const rooms = await database_1.DatabaseService.find({
            selector: {
                type: 'room',
                participants: {
                    $elemMatch: {
                        id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
                    }
                }
            }
        });
        res.json({
            success: true,
            data: rooms
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChatRooms = getChatRooms;
const createChatRoom = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const timestamp = new Date().toISOString();
        const roomData = {
            type: 'room',
            name: req.body.name,
            roomType: req.body.roomType,
            participants: [
                {
                    id: req.user.id,
                    name: req.user.name,
                    avatar: req.user.avatar,
                    role: 'admin',
                    joinedAt: timestamp
                },
                ...req.body.participants.map((p) => ({
                    ...p,
                    role: 'member',
                    joinedAt: timestamp
                }))
            ],
            settings: {
                isEncrypted: false,
                allowReactions: true,
                allowReplies: true,
                allowEditing: true,
                allowDeletion: true,
                ...req.body.settings
            }
        };
        const room = await database_1.DatabaseService.create(roomData);
        // Notify all participants about the new room
        room.participants.forEach(participant => {
            var _a;
            if (participant.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                realtime_service_1.RealtimeService.getInstance().emitToUser(participant.id, 'room_created', { room });
            }
        });
        res.status(201).json({
            success: true,
            data: room
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createChatRoom = createChatRoom;
const getChatRoom = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const room = await database_1.DatabaseService.read(id);
        if (!room) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        // Validate room structure according to ChatRoom interface
        if (!room.type || room.type !== 'room' || !room.name || !room.roomType ||
            !room.participants || !Array.isArray(room.participants) || room.participants.length === 0) {
            throw new errorHandler_1.ApiError('Invalid room structure', 500);
        }
        // Check if user is a participant
        if (!room.participants.some(p => { var _a; return p.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to access this chat room', 403);
        }
        res.json({
            success: true,
            data: room
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChatRoom = getChatRoom;
const getChatHistory = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { before, limit = 50 } = req.query;
        // Check if user is a participant
        const room = await database_1.DatabaseService.read(roomId);
        if (!room || !room.participants.some(p => { var _a; return p.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to access this chat room', 403);
        }
        const query = {
            selector: {
                type: 'message',
                roomId,
                ...(before ? { createdAt: { $lt: String(before) } } : {})
            },
            limit: Number(limit),
            sort: [{ createdAt: 'desc' }]
        };
        const messages = await database_1.DatabaseService.find(query);
        res.json({
            success: true,
            data: messages.reverse() // Return in chronological order
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChatHistory = getChatHistory;
const sendMessage = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { roomId } = req.params;
        const { content, replyTo, attachments } = req.body;
        // Check if user is a participant
        const room = await database_1.DatabaseService.read(roomId);
        if (!room || !room.participants.some(p => { var _a; return p.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to send messages in this room', 403);
        }
        const messageData = {
            type: 'message',
            content,
            roomId,
            sender: {
                id: req.user.id,
                name: req.user.name,
                avatar: req.user.avatar
            },
            ...(replyTo && { replyTo }),
            ...(attachments && { attachments })
        };
        const message = await database_1.DatabaseService.create(messageData);
        // Update room's last message
        await database_1.DatabaseService.update(roomId, {
            lastMessage: {
                id: message._id,
                content: message.content,
                sender: message.sender,
                sentAt: message.createdAt
            }
        });
        // Broadcast message to room
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(roomId, 'message', message);
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;
const deleteMessage = async (req, res, next) => {
    var _a;
    try {
        const { messageId } = req.params;
        const message = await database_1.DatabaseService.read(messageId);
        if (!message) {
            throw new errorHandler_1.ApiError('Message not found', 404);
        }
        // Check if user is the sender or an admin
        const room = await database_1.DatabaseService.read(message.roomId);
        const isAdmin = room === null || room === void 0 ? void 0 : room.participants.some(p => { var _a; return p.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && p.role === 'admin'; });
        if (message.sender.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && !isAdmin) {
            throw new errorHandler_1.ApiError('Not authorized to delete this message', 403);
        }
        const deletedMessage = await database_1.DatabaseService.update(messageId, {
            deletedAt: new Date().toISOString()
        });
        // Notify room about deleted message
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(message.roomId, 'message_deleted', {
            messageId,
            roomId: message.roomId
        });
        res.json({
            success: true,
            data: deletedMessage
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=chat.controller.js.map