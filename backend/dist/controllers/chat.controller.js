"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.sendMessage = exports.getChatHistory = exports.getChatRoom = exports.createChatRoom = exports.getChatRooms = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
const getChatRooms = async (req, res, next) => {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const rooms = await database_1.DatabaseService.find({
            selector: {
                type: 'chatroom',
                participants: {
                    $elemMatch: {
                        userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id
                    }
                }
            }
        });
        // Transform rooms to match frontend expectations
        const transformedRooms = rooms.map(room => {
            var _a;
            return ({
                id: room._id,
                name: room.name,
                type: room.type || 'community',
                description: room.description || '',
                currentUserId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || '',
                participants: room.participants.map(p => ({
                    id: p.userId,
                    name: p.name,
                    avatar: p.avatar || '',
                    status: 'online',
                    lastSeen: p.lastReadTimestamp
                })),
                lastMessage: room.lastMessage,
                unreadCount: 0,
                createdAt: room.createdAt,
                updatedAt: room.updatedAt
            });
        });
        res.json({
            success: true,
            data: transformedRooms
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChatRooms = getChatRooms;
const createChatRoom = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const timestamp = new Date().toISOString();
        const roomData = {
            type: 'chatroom',
            name: req.body.name || 'New Chat Room',
            description: req.body.description || '',
            avatar: req.body.avatar || '',
            participants: [
                {
                    userId: req.user.id,
                    name: req.user.name || '',
                    avatar: req.user.avatar || '',
                    role: 'admin',
                    joinedAt: timestamp
                },
                ...(((_b = req.body.participants) === null || _b === void 0 ? void 0 : _b.map((p) => ({
                    userId: p.userId,
                    name: p.name || '',
                    avatar: p.avatar || '',
                    role: 'member',
                    joinedAt: timestamp
                }))) || [])
            ],
            settings: {
                isPrivate: (_d = (_c = req.body.settings) === null || _c === void 0 ? void 0 : _c.isPrivate) !== null && _d !== void 0 ? _d : false,
                allowReactions: (_f = (_e = req.body.settings) === null || _e === void 0 ? void 0 : _e.allowReactions) !== null && _f !== void 0 ? _f : true,
                allowAttachments: (_h = (_g = req.body.settings) === null || _g === void 0 ? void 0 : _g.allowAttachments) !== null && _h !== void 0 ? _h : true,
                allowReplies: (_k = (_j = req.body.settings) === null || _j === void 0 ? void 0 : _j.allowReplies) !== null && _k !== void 0 ? _k : true,
                allowEditing: (_m = (_l = req.body.settings) === null || _l === void 0 ? void 0 : _l.allowEditing) !== null && _m !== void 0 ? _m : true,
                allowDeletion: (_p = (_o = req.body.settings) === null || _o === void 0 ? void 0 : _o.allowDeletion) !== null && _p !== void 0 ? _p : true
            }
        };
        const room = await database_1.DatabaseService.create(roomData);
        // Transform room to match frontend expectations
        const transformedRoom = {
            id: room._id,
            name: room.name,
            type: room.type || 'community',
            description: room.description || '',
            currentUserId: req.user.id,
            participants: room.participants.map(p => ({
                id: p.userId,
                name: p.name,
                avatar: p.avatar || '',
                status: 'online',
                lastSeen: p.lastReadTimestamp
            })),
            lastMessage: room.lastMessage,
            unreadCount: 0,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt
        };
        // Notify all participants about the new room
        room.participants.forEach(participant => {
            var _a;
            if (participant.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                realtime_service_1.RealtimeService.getInstance().emitToUser(participant.userId, 'room_created', { room: transformedRoom });
            }
        });
        res.status(201).json({
            success: true,
            data: transformedRoom
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
        const roomId = req.params.roomId;
        if (!roomId) {
            throw new errorHandler_1.ApiError('Room ID is required', 400);
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Get the room by ID
        const room = await database_1.DatabaseService.read(roomId);
        if (!room) {
            logger_1.default.error(`Chat room not found with ID: ${roomId}`);
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Chat room not found'
                }
            });
        }
        // Verify it's a chat room
        if (room.type !== 'chatroom') {
            logger_1.default.error(`Invalid room type for ID ${roomId}: ${room.type}`);
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Invalid chat room'
                }
            });
        }
        if (!room.participants) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Invalid chat room data'
                }
            });
        }
        // Check if user is a participant
        const isParticipant = room.participants.some(p => { var _a; return p.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Not authorized to access this chat room'
                }
            });
        }
        // Transform the room data to match frontend expectations
        const transformedRoom = {
            id: room._id,
            name: room.name,
            type: room.type || 'community',
            description: room.description || '',
            currentUserId: req.user.id,
            participants: room.participants.map(p => ({
                id: p.userId,
                name: p.name,
                avatar: p.avatar || '',
                status: 'online',
                lastSeen: p.lastReadTimestamp
            })),
            lastMessage: room.lastMessage,
            unreadCount: 0,
            createdAt: room.createdAt || new Date().toISOString(),
            updatedAt: room.updatedAt || new Date().toISOString()
        };
        res.json({
            success: true,
            data: transformedRoom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChatRoom = getChatRoom;
const getChatHistory = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const roomId = req.params.roomId;
        if (!roomId) {
            throw new errorHandler_1.ApiError('Room ID is required', 400);
        }
        const { before } = req.query;
        const limit = Number(req.query.limit) || 50;
        // Check if user is a participant
        const room = await database_1.DatabaseService.read(roomId);
        if (!room || !room.participants) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        if (!room.participants.some(p => { var _a; return p.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to access this chat room', 403);
        }
        const query = {
            selector: {
                type: 'message',
                roomId: roomId,
                ...(before ? { createdAt: { $lt: String(before) } } : {})
            },
            limit: limit,
            sort: [{ createdAt: 'desc' }]
        };
        const messages = await database_1.DatabaseService.find(query);
        // Transform messages to match frontend expectations
        const transformedMessages = messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar || '',
            timestamp: msg.timestamp,
            reactions: msg.reactions || {}
        }));
        res.json({
            success: true,
            data: transformedMessages.reverse() // Return in chronological order
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
        const roomId = req.params.roomId;
        if (!roomId) {
            throw new errorHandler_1.ApiError('Room ID is required', 400);
        }
        const content = req.body.content;
        if (!content) {
            throw new errorHandler_1.ApiError('Message content is required', 400);
        }
        const { replyTo, attachments } = req.body;
        // Check if user is a participant
        const room = await database_1.DatabaseService.read(roomId);
        if (!room || !room.participants) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        if (!room.participants.some(p => { var _a; return p.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to send messages in this room', 403);
        }
        const messageData = {
            type: 'message',
            content,
            roomId,
            senderId: req.user.id,
            senderName: req.user.name || '',
            senderAvatar: req.user.avatar || '',
            timestamp: new Date().toISOString(),
            ...(replyTo && {
                replyTo: {
                    messageId: replyTo,
                    content: content,
                    senderId: req.user.id,
                    senderName: req.user.name || ''
                }
            }),
            ...(attachments && { attachments })
        };
        const message = await database_1.DatabaseService.create(messageData);
        // Transform message to match frontend expectations
        const transformedMessage = {
            id: message._id,
            content: message.content,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar || '',
            timestamp: message.timestamp,
            reactions: message.reactions || {}
        };
        // Update room's last message
        await database_1.DatabaseService.update(roomId, {
            lastMessage: {
                content: message.content,
                senderId: message.senderId,
                senderName: message.senderName,
                timestamp: message.timestamp
            }
        });
        // Broadcast message to room
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(roomId, 'message', transformedMessage);
        res.status(201).json({
            success: true,
            data: transformedMessage
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;
const deleteMessage = async (req, res, next) => {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const messageId = req.params.messageId;
        if (!messageId) {
            throw new errorHandler_1.ApiError('Message ID is required', 400);
        }
        const message = await database_1.DatabaseService.read(messageId);
        if (!message) {
            throw new errorHandler_1.ApiError('Message not found', 404);
        }
        // Check if user is the sender or an admin
        const room = await database_1.DatabaseService.read(message.roomId);
        if (!room || !room.participants) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        const isAdmin = room.participants.some(p => { var _a; return p.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && p.role === 'admin'; });
        if (message.senderId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) && !isAdmin) {
            throw new errorHandler_1.ApiError('Not authorized to delete this message', 403);
        }
        const deletedMessage = await database_1.DatabaseService.update(messageId, {
            isDeleted: true,
            deletedAt: new Date().toISOString()
        });
        // Transform deleted message to match frontend expectations
        const transformedMessage = {
            id: deletedMessage._id,
            content: deletedMessage.content,
            senderId: deletedMessage.senderId,
            senderName: deletedMessage.senderName,
            senderAvatar: deletedMessage.senderAvatar || '',
            timestamp: deletedMessage.timestamp,
            reactions: deletedMessage.reactions || {},
            isDeleted: deletedMessage.isDeleted,
            deletedAt: deletedMessage.deletedAt
        };
        // Notify room about deleted message
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(message.roomId, 'message_deleted', {
            messageId: messageId,
            roomId: message.roomId
        });
        res.json({
            success: true,
            data: transformedMessage
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=chat.controller.js.map