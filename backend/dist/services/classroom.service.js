"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomService = void 0;
const database_1 = require("./database");
const logger_1 = __importDefault(require("../config/logger"));
class ClassroomService {
    static async createIndexes() {
        try {
            // Index for classrooms by teacher
            const teacherIndex = {
                index: {
                    fields: ['type', 'teacher.id']
                },
                ddoc: 'classrooms-by-teacher-index',
                name: 'classrooms-by-teacher-index'
            };
            // Index for classrooms by student
            const studentIndex = {
                index: {
                    fields: ['type', 'students.id']
                },
                ddoc: 'classrooms-by-student-index',
                name: 'classrooms-by-student-index'
            };
            // Index for active classrooms
            const activeIndex = {
                index: {
                    fields: ['type', 'settings.isArchived', 'updatedAt']
                },
                ddoc: 'active-classrooms-index',
                name: 'active-classrooms-index'
            };
            await Promise.all([
                database_1.DatabaseService.createIndex(teacherIndex),
                database_1.DatabaseService.createIndex(studentIndex),
                database_1.DatabaseService.createIndex(activeIndex)
            ]);
            logger_1.default.info('Created classroom indexes');
        }
        catch (error) {
            logger_1.default.error('Error creating classroom indexes:', error);
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
}
exports.ClassroomService = ClassroomService;
ClassroomService.TYPE = 'classroom';
exports.default = ClassroomService;
//# sourceMappingURL=classroom.service.js.map