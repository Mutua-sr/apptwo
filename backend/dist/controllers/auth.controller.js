"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = exports.getMe = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../services/database");
const types_1 = require("../types");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const profile = await database_1.DatabaseService.read(req.user.profileId);
        if (!profile) {
            const error = new Error('Profile not found');
            error.statusCode = 404;
            throw error;
        }
        res.json({
            success: true,
            data: {
                id: req.user.id,
                profileId: profile._id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
                avatar: profile.avatar
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
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
        // Find or create profile
        const profiles = await database_1.DatabaseService.find({
            selector: {
                type: 'profile',
                userId: user._id
            }
        });
        let profile = profiles[0];
        if (!profile) {
            // Create profile if it doesn't exist
            const newProfileData = {
                type: 'profile',
                userId: user._id,
                username: email.split('@')[0],
                email: user.email,
                name: user.name,
                role: user.role,
                settings: {
                    notifications: {
                        email: true,
                        push: true,
                        inApp: true
                    },
                    privacy: {
                        showEmail: false,
                        showActivity: true,
                        allowMessages: true
                    },
                    theme: 'light',
                    language: 'en'
                },
                stats: {
                    posts: 0,
                    communities: 0,
                    classrooms: 0,
                    lastActive: new Date().toISOString()
                }
            };
            profile = await database_1.DatabaseService.create(newProfileData);
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            profileId: profile._id,
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
                    profileId: profile._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: profile.avatar
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
        const { email, password, name, role } = req.body; // Accept role from request
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
            role: role || types_1.UserRole.STUDENT // Default to STUDENT if no role provided
        };
        const user = await database_1.DatabaseService.create(userData);
        // Create associated profile document
        const newProfileData = {
            type: 'profile',
            userId: user._id,
            username: email.split('@')[0],
            email,
            name,
            role: userData.role,
            settings: {
                notifications: {
                    email: true,
                    push: true,
                    inApp: true
                },
                privacy: {
                    showEmail: false,
                    showActivity: true,
                    allowMessages: true
                },
                theme: 'light',
                language: 'en'
            },
            stats: {
                posts: 0,
                communities: 0,
                classrooms: 0,
                lastActive: new Date().toISOString()
            }
        };
        const profile = await database_1.DatabaseService.create(newProfileData);
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            profileId: profile._id,
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
                    profileId: profile._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: profile.avatar
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