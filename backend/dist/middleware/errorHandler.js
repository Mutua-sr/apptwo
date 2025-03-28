"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.DatabaseError = exports.ApiError = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class ApiError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
class DatabaseError extends ApiError {
    constructor(message, statusCode = 500, code, details) {
        super(message, statusCode, code || 'DATABASE_ERROR', details);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
const notFound = (req, _, next) => {
    const error = new ApiError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, _) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const details = err.details;
    // Log error
    logger_1.default.error('Error:', {
        path: req.path,
        statusCode,
        message,
        code,
        details,
        stack: err.stack
    });
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map