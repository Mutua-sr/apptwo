"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 's3cureR@nd0mStr1ngF0rJWT';
const auth = async (req, _, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        console.log('Received token:', token); // Log the received token
        if (!token) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            throw error;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            profileId: decoded.profileId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        const apiError = new Error('Please authenticate');
        apiError.statusCode = 401;
        next(apiError);
    }
};
exports.auth = auth;
//# sourceMappingURL=auth.js.map