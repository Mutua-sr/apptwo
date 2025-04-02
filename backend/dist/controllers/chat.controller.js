"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatRoom = getChatRoom;
exports.getChatHistory = getChatHistory;
exports.sendMessage = sendMessage;
exports.deleteMessage = deleteMessage;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
async function getChatRoom(req, res, next) {
    try {
        const { roomId } = req.params;
        const room = await database_1.DatabaseService.read(roomId);
        if (!room) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        // Check if user has access to this room
        if (!room.participants.some(p => { var _a; return p.userId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Access denied', 403);
        }
        return res.json({
            success: true,
            data: room
        });
    }
    catch (error) {
        next(error);
    }
}
async function getChatHistory(req, res, next) {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;
        const query = {
            selector: {
                type: 'message',
                roomId,
                ...(before && {
                    timestamp: {
                        $lt: before.toString()
                    }
                })
            },
            sort: [{ timestamp: 'desc' }],
            limit: Number(limit)
        };
        const messages = await database_1.DatabaseService.find(query);
        return res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        next(error);
    }
}
async function sendMessage(req, res, next) {
    var _a, _b, _c;
    try {
        const { roomId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userName = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
        if (!userId || !userName) {
            throw new errorHandler_1.ApiError('User not authenticated', 401);
        }
        const room = await database_1.DatabaseService.read(roomId);
        if (!room) {
            throw new errorHandler_1.ApiError('Chat room not found', 404);
        }
        // Check if user has access to this room
        if (!room.participants.some(p => p.userId === userId)) {
            throw new errorHandler_1.ApiError('Access denied', 403);
        }
        const message = {
            type: 'message',
            roomId,
            content,
            senderId: userId,
            senderName: userName,
            senderAvatar: (_c = req.user) === null || _c === void 0 ? void 0 : _c.avatar,
            timestamp: new Date().toISOString(),
            reactions: {},
            isEdited: false,
            isDeleted: false
        };
        const savedMessage = await database_1.DatabaseService.create(message);
        // Update room's last message
        await database_1.DatabaseService.update(roomId, {
            lastMessage: {
                content: savedMessage.content,
                senderId: savedMessage.senderId,
                senderName: savedMessage.senderName,
                timestamp: savedMessage.timestamp
            }
        });
        // Notify room members about new message
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(roomId, 'message', savedMessage);
        return res.json({
            success: true,
            data: savedMessage
        });
    }
    catch (error) {
        logger_1.default.error('Error sending message:', error);
        next(error);
    }
}
async function deleteMessage(req, res, next) {
    var _a;
    try {
        const { messageId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.ApiError('User not authenticated', 401);
        }
        const message = await database_1.DatabaseService.read(messageId);
        if (!message) {
            throw new errorHandler_1.ApiError('Message not found', 404);
        }
        // Check if user is the message sender
        if (message.senderId !== userId) {
            throw new errorHandler_1.ApiError('Access denied', 403);
        }
        // Soft delete the message
        const updatedMessage = await database_1.DatabaseService.update(messageId, {
            isDeleted: true,
            deletedAt: new Date().toISOString()
        });
        // Notify room members about message deletion
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(message.roomId, 'message_deleted', {
            messageId,
            roomId: message.roomId
        });
        return res.json({
            success: true,
            data: { messageId }
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting message:', error);
        next(error);
    }
}
//# sourceMappingURL=chat.controller.js.map