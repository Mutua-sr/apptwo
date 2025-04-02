"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomService = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
class ClassroomService {
    static async getById(id) {
        try {
            return await database_1.DatabaseService.read(id);
        }
        catch (error) {
            logger_1.default.error(`Error getting classroom ${id}:`, error);
            throw new Error('Failed to get classroom');
        }
    }
    static async list(page = 1, limit = 10) {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    'settings.isArchived': false
                },
                use_index: 'active-classrooms-index',
                sort: [{ updatedAt: 'desc' }]
            };
            const skip = (page - 1) * limit;
            const results = await database_1.DatabaseService.find(query);
            return results.slice(skip, skip + limit);
        }
        catch (error) {
            logger_1.default.error('Error listing classrooms:', error);
            throw new Error('Failed to list classrooms');
        }
    }
    static async create(data) {
        try {
            const classroom = {
                type: this.TYPE,
                name: data.name,
                description: data.description,
                code: Math.random().toString(36).substring(7).toUpperCase(),
                teacher: data.teacher || {
                    id: '',
                    name: '',
                    avatar: undefined
                },
                students: [],
                assignments: [],
                materials: [],
                schedule: [],
                settings: {
                    allowStudentPosts: true,
                    allowStudentComments: true,
                    allowStudentChat: true,
                    isArchived: false,
                    notifications: {
                        assignments: true,
                        materials: true,
                        announcements: true
                    },
                    ...data.settings
                }
            };
            return await database_1.DatabaseService.create(classroom);
        }
        catch (error) {
            logger_1.default.error('Error creating classroom:', error);
            throw new Error('Failed to create classroom');
        }
    }
    static async update(id, data) {
        try {
            const existing = await database_1.DatabaseService.read(id);
            if (!existing) {
                throw new Error('Classroom not found');
            }
            const updateData = {
                ...data,
                settings: data.settings ? {
                    ...existing.settings,
                    ...data.settings,
                    notifications: data.settings.notifications ? {
                        ...existing.settings.notifications,
                        ...data.settings.notifications
                    } : existing.settings.notifications
                } : undefined
            };
            return await database_1.DatabaseService.update(id, updateData);
        }
        catch (error) {
            logger_1.default.error(`Error updating classroom ${id}:`, error);
            throw new Error('Failed to update classroom');
        }
    }
    static async delete(id) {
        try {
            await database_1.DatabaseService.delete(id);
            return true;
        }
        catch (error) {
            logger_1.default.error(`Error deleting classroom ${id}:`, error);
            throw new Error('Failed to delete classroom');
        }
    }
    static async getByTeacher(teacherId) {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    'teacher.id': teacherId,
                    'settings.isArchived': false
                },
                use_index: 'classrooms-by-teacher-index',
                sort: [{ updatedAt: 'desc' }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting classrooms for teacher ${teacherId}:`, error);
            throw new Error('Failed to get classrooms by teacher');
        }
    }
    static async getByStudent(studentId) {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    'students': {
                        $elemMatch: {
                            id: studentId,
                            status: 'active'
                        }
                    },
                    'settings.isArchived': false
                },
                use_index: 'classrooms-by-student-index',
                sort: [{ updatedAt: 'desc' }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting classrooms for student ${studentId}:`, error);
            throw new Error('Failed to get classrooms by student');
        }
    }
    static async getActiveClassrooms() {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    'settings.isArchived': false
                },
                use_index: 'active-classrooms-index',
                sort: [{ updatedAt: 'desc' }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error('Error getting active classrooms:', error);
            throw new Error('Failed to get active classrooms');
        }
    }
    static async getAll(userId) {
        try {
            const query = {
                selector: {
                    type: this.TYPE,
                    'settings.isArchived': false,
                    $or: [
                        { 'teacher.id': userId },
                        {
                            students: {
                                $elemMatch: {
                                    id: userId,
                                    status: 'active'
                                }
                            }
                        }
                    ]
                },
                use_index: 'active-classrooms-index',
                sort: [{ updatedAt: 'desc' }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error('Error getting all classrooms:', error);
            throw new Error('Failed to get classrooms');
        }
    }
}
exports.ClassroomService = ClassroomService;
ClassroomService.TYPE = 'classroom';
exports.default = ClassroomService;
//# sourceMappingURL=classroom.service.js.map