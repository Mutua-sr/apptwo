"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../services/database");
const types_1 = require("../types");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }
        const users = await database_1.DatabaseService.find({
            selector: {
                type: 'user',
                email
            }
        });
        const user = users[0];
        if (!user || user.password !== password) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            const error = new Error('Email, password, and name are required');
            error.statusCode = 400;
            throw error;
        }
        const existingUsers = await database_1.DatabaseService.find({
            selector: {
                type: 'user',
                email
            }
        });
        if (existingUsers.length > 0) {
            const error = new Error('Email already exists');
            error.statusCode = 400;
            throw error;
        }
        const userData = {
            type: 'user',
            email,
            password,
            name,
            role: types_1.UserRole.STUDENT // Default role for new users
        };
        const user = await database_1.DatabaseService.create(userData);
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
//# sourceMappingURL=auth.controller.js.map