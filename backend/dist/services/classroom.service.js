"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomService = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
class ClassroomService {
    static async create(input) {
        try {
            const defaultSettings = {
                allowStudentPosts: true,
                allowStudentComments: true,
                isArchived: false,
                notifications: {
                    assignments: true,
                    materials: true,
                    announcements: true
                }
            };
            const classroom = {
                ...input,
                type: this.TYPE,
                code: Math.random().toString(36).substring(7).toUpperCase(),
                students: [],
                assignments: [],
                materials: [],
                schedule: [],
                settings: defaultSettings
            };
            return await database_1.DatabaseService.create(classroom);
        }
        catch (error) {
            logger_1.default.error('Error creating classroom:', error);
            throw new Error('Failed to create classroom');
        }
    }
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
            const skip = (page - 1) * limit;
            const query = {
                selector: {
                    type: this.TYPE
                },
                sort: [{ createdAt: 'desc' }],
                skip,
                limit
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error('Error listing classrooms:', error);
            throw new Error('Failed to list classrooms');
        }
    }
    static async update(id, input) {
        try {
            const classroom = await this.getById(id);
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            const updatedSettings = input.settings
                ? {
                    ...classroom.settings,
                    ...input.settings,
                    notifications: {
                        ...classroom.settings.notifications,
                        ...input.settings.notifications
                    }
                }
                : undefined;
            const updateData = {
                ...input,
                settings: updatedSettings
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
            return await database_1.DatabaseService.delete(id);
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
                    'teacher.id': teacherId
                },
                sort: [{ createdAt: 'desc' }]
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
                            id: studentId
                        }
                    }
                },
                sort: [{ createdAt: 'desc' }]
            };
            return await database_1.DatabaseService.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting classrooms for student ${studentId}:`, error);
            throw new Error('Failed to get classrooms by student');
        }
    }
    static async addStudent(classroomId, student) {
        try {
            const classroom = await this.getById(classroomId);
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            if (classroom.students.some(s => s.id === student.id)) {
                throw new Error('Student already in classroom');
            }
            const newStudent = {
                ...student,
                joinedAt: new Date().toISOString(),
                status: 'active'
            };
            const updatedClassroom = {
                ...classroom,
                students: [...classroom.students, newStudent]
            };
            return await database_1.DatabaseService.update(classroomId, updatedClassroom);
        }
        catch (error) {
            logger_1.default.error(`Error adding student to classroom ${classroomId}:`, error);
            throw new Error('Failed to add student to classroom');
        }
    }
    static async removeStudent(classroomId, studentId) {
        try {
            const classroom = await this.getById(classroomId);
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            const updatedClassroom = {
                ...classroom,
                students: classroom.students.filter(s => s.id !== studentId)
            };
            return await database_1.DatabaseService.update(classroomId, updatedClassroom);
        }
        catch (error) {
            logger_1.default.error(`Error removing student from classroom ${classroomId}:`, error);
            throw new Error('Failed to remove student from classroom');
        }
    }
}
exports.ClassroomService = ClassroomService;
ClassroomService.TYPE = 'classroom';
exports.default = ClassroomService;
//# sourceMappingURL=classroom.service.js.map