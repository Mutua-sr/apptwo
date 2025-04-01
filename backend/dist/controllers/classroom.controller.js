"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClassroom = exports.addMaterial = exports.addAssignment = exports.joinClassroom = exports.updateClassroom = exports.getClassroom = exports.createClassroom = exports.getClassrooms = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const classroom_service_1 = require("../services/classroom.service");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
// Helper function to generate a unique classroom code
const generateClassroomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
const getClassrooms = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        const { role = 'all' } = req.query;
        let classrooms;
        switch (role) {
            case 'teacher':
                classrooms = await classroom_service_1.ClassroomService.getByTeacher(req.user.id);
                break;
            case 'student':
                classrooms = await classroom_service_1.ClassroomService.getByStudent(req.user.id);
                break;
            default:
                classrooms = await classroom_service_1.ClassroomService.getAll(req.user.id);
        }
        // Add real-time data like unread messages count
        const classroomsWithMeta = await Promise.all(classrooms.map(async (classroom) => {
            const unreadCount = await realtime_service_1.RealtimeService.getInstance().getUnreadCount(`classroom-${classroom._id}`, req.user.id);
            return {
                ...classroom,
                unreadCount
            };
        }));
        res.json({
            success: true,
            data: classroomsWithMeta
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassrooms = getClassrooms;
const createClassroom = async (req, res, next) => {
    var _a, _b, _c;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Unauthorized', 401);
        }
        // Validate required fields
        if (!((_b = req.body.name) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new errorHandler_1.ApiError('Name is required', 400);
        }
        if (!((_c = req.body.description) === null || _c === void 0 ? void 0 : _c.trim())) {
            throw new errorHandler_1.ApiError('Description is required', 400);
        }
        const classroomData = {
            type: 'classroom',
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            code: generateClassroomCode(),
            teacher: {
                id: req.user.id,
                name: req.user.name,
                avatar: req.user.avatar
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
                }
            }
        };
        const classroom = await database_1.DatabaseService.create(classroomData);
        logger_1.default.info(`Classroom created: ${classroom._id} by teacher ${req.user.id}`);
        res.status(201).json({
            success: true,
            data: classroom
        });
    }
    catch (error) {
        logger_1.default.error('Error creating classroom:', error);
        next(error);
    }
};
exports.createClassroom = createClassroom;
const getClassroom = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Check if user has access to the classroom
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
            !classroom.students.some(student => { var _a; return student.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to access this classroom', 403);
        }
        // Add real-time data
        const unreadCount = await realtime_service_1.RealtimeService.getInstance().getUnreadCount(`classroom-${classroom._id}`, req.user.id);
        res.json({
            success: true,
            data: {
                ...classroom,
                unreadCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassroom = getClassroom;
const updateClassroom = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Only teacher can update classroom
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to update this classroom', 403);
        }
        const updateData = {
            ...(req.body.name && { name: req.body.name.trim() }),
            ...(req.body.description && { description: req.body.description.trim() }),
            ...(req.body.settings && {
                settings: {
                    allowStudentPosts: (_b = req.body.settings.allowStudentPosts) !== null && _b !== void 0 ? _b : classroom.settings.allowStudentPosts,
                    allowStudentComments: (_c = req.body.settings.allowStudentComments) !== null && _c !== void 0 ? _c : classroom.settings.allowStudentComments,
                    allowStudentChat: (_d = req.body.settings.allowStudentChat) !== null && _d !== void 0 ? _d : classroom.settings.allowStudentChat,
                    isArchived: (_e = req.body.settings.isArchived) !== null && _e !== void 0 ? _e : classroom.settings.isArchived,
                    notifications: {
                        assignments: (_g = (_f = req.body.settings.notifications) === null || _f === void 0 ? void 0 : _f.assignments) !== null && _g !== void 0 ? _g : classroom.settings.notifications.assignments,
                        materials: (_j = (_h = req.body.settings.notifications) === null || _h === void 0 ? void 0 : _h.materials) !== null && _j !== void 0 ? _j : classroom.settings.notifications.materials,
                        announcements: (_l = (_k = req.body.settings.notifications) === null || _k === void 0 ? void 0 : _k.announcements) !== null && _l !== void 0 ? _l : classroom.settings.notifications.announcements
                    }
                }
            })
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, updateData);
        // Notify about classroom update
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'classroom_updated', updatedClassroom);
        res.json({
            success: true,
            data: updatedClassroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateClassroom = updateClassroom;
const joinClassroom = async (req, res, next) => {
    var _a;
    try {
        const { code } = req.params;
        // Find classroom by code
        const classrooms = await database_1.DatabaseService.find({
            selector: {
                type: 'classroom',
                code
            }
        });
        if (classrooms.length === 0) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        const classroom = classrooms[0];
        // Check if user is already a student
        if (classroom.students.some(student => { var _a; return student.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Already a member of this classroom', 400);
        }
        // Add student to classroom
        const newStudent = {
            id: req.user.id,
            name: req.user.name,
            avatar: (_a = req.user) === null || _a === void 0 ? void 0 : _a.avatar,
            joinedAt: new Date().toISOString(),
            status: 'active'
        };
        const updatedClassroom = await database_1.DatabaseService.update(classroom._id, {
            students: [...classroom.students, newStudent]
        });
        // Notify about new student
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(classroom._id, 'student_joined', {
            classroomId: classroom._id,
            student: newStudent
        });
        res.json({
            success: true,
            data: updatedClassroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.joinClassroom = joinClassroom;
const addAssignment = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Only teacher can add assignments
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to add assignments', 403);
        }
        const assignment = {
            id: `assignment_${Date.now()}`,
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            points: req.body.points,
            attachments: req.body.attachments || [],
            submissions: []
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            assignments: [...classroom.assignments, assignment]
        });
        // Notify about new assignment
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'new_assignment', {
            classroomId: id,
            assignment
        });
        res.json({
            success: true,
            data: updatedClassroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addAssignment = addAssignment;
const addMaterial = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Only teacher can add materials
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to add materials', 403);
        }
        const material = {
            id: `material_${Date.now()}`,
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            url: req.body.url,
            uploadedAt: new Date().toISOString(),
            tags: req.body.tags || []
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            materials: [...classroom.materials, material]
        });
        // Notify about new material
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'new_material', {
            classroomId: id,
            material
        });
        res.json({
            success: true,
            data: updatedClassroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addMaterial = addMaterial;
const deleteClassroom = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to delete this classroom', 403);
        }
        await database_1.DatabaseService.delete(id);
        res.json({
            success: true,
            data: { message: 'Classroom deleted successfully' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClassroom = deleteClassroom;
//# sourceMappingURL=classroom.controller.js.map