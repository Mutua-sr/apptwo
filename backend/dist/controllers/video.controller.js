"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSessions = exports.endSession = exports.updateSessionStatus = exports.getSession = exports.createSession = void 0;
const video_service_1 = require("../services/video.service");
const errorHandler_1 = require("../middleware/errorHandler");
const videoService = new video_service_1.VideoService();
const createSession = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const dto = {
            caller: req.user.id,
            receiver: req.body.receiver
        };
        const session = await videoService.createSession(dto);
        res.status(201).json({
            success: true,
            data: { session }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSession = createSession;
const getSession = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { sessionId } = req.params;
        const session = await videoService.getSession(sessionId);
        if (!session) {
            throw new errorHandler_1.ApiError('Session not found', 404);
        }
        // Check if user is part of the call
        if (session.caller !== req.user.id && session.receiver !== req.user.id) {
            throw new errorHandler_1.ApiError('Not authorized to access this session', 403);
        }
        res.json({
            success: true,
            data: { session }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSession = getSession;
const updateSessionStatus = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { sessionId } = req.params;
        const { status } = req.body;
        const session = await videoService.updateSessionStatus(sessionId, status, req.user.id);
        res.json({
            success: true,
            data: { session }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSessionStatus = updateSessionStatus;
const endSession = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { sessionId } = req.params;
        const session = await videoService.endSession(sessionId, req.user.id);
        res.json({
            success: true,
            data: { session }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.endSession = endSession;
// Admin endpoint to cleanup old sessions
const cleanupSessions = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Check if user is admin (you should implement proper role checking)
        if (req.user.role !== 'admin') {
            throw new errorHandler_1.ApiError('Not authorized to perform this action', 403);
        }
        await videoService.cleanupSessions();
        res.json({
            success: true,
            data: { message: 'Old sessions cleaned up successfully' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanupSessions = cleanupSessions;
//# sourceMappingURL=video.controller.js.map