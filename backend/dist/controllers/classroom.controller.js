"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassrooms = exports.submitAssignment = exports.gradeSubmission = exports.addScheduleEvent = exports.deleteClassroom = exports.addMaterial = exports.addAssignment = exports.joinClassroom = exports.updateClassroom = exports.getClassroom = exports.createClassroom = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
// Helper function to generate a unique classroom code
const generateClassroomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
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
        res.json({
            success: true,
            data: classroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassroom = getClassroom;
const updateClassroom = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
                    isArchived: (_d = req.body.settings.isArchived) !== null && _d !== void 0 ? _d : classroom.settings.isArchived,
                    notifications: {
                        assignments: (_f = (_e = req.body.settings.notifications) === null || _e === void 0 ? void 0 : _e.assignments) !== null && _f !== void 0 ? _f : classroom.settings.notifications.assignments,
                        materials: (_h = (_g = req.body.settings.notifications) === null || _g === void 0 ? void 0 : _g.materials) !== null && _h !== void 0 ? _h : classroom.settings.notifications.materials,
                        announcements: (_k = (_j = req.body.settings.notifications) === null || _j === void 0 ? void 0 : _j.announcements) !== null && _k !== void 0 ? _k : classroom.settings.notifications.announcements
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
const addScheduleEvent = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to add schedule events', 403);
        }
        const event = {
            id: `event_${Date.now()}`,
            title: req.body.title,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            recurring: req.body.recurring
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            schedule: [...classroom.schedule, event]
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
exports.addScheduleEvent = addScheduleEvent;
const gradeSubmission = async (req, res, next) => {
    var _a;
    try {
        const { classroomId, assignmentId, studentId } = req.params;
        const classroom = await database_1.DatabaseService.read(classroomId);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to grade submissions', 403);
        }
        const assignment = classroom.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            throw new errorHandler_1.ApiError('Assignment not found', 404);
        }
        const submission = assignment.submissions.find(s => s.studentId === studentId);
        if (!submission) {
            throw new errorHandler_1.ApiError('Submission not found', 404);
        }
        const updatedAssignments = classroom.assignments.map(a => {
            if (a.id === assignmentId) {
                return {
                    ...a,
                    submissions: a.submissions.map(s => {
                        if (s.studentId === studentId) {
                            return {
                                ...s,
                                grade: req.body.grade,
                                feedback: req.body.feedback
                            };
                        }
                        return s;
                    })
                };
            }
            return a;
        });
        const updatedClassroom = await database_1.DatabaseService.update(classroomId, {
            assignments: updatedAssignments
        });
        // Notify student about grade
        realtime_service_1.RealtimeService.getInstance().emitToUser(studentId, 'assignment_graded', {
            classroomId,
            assignmentId,
            grade: req.body.grade,
            feedback: req.body.feedback
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
exports.gradeSubmission = gradeSubmission;
const submitAssignment = async (req, res, next) => {
    try {
        const { id, assignmentId } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Check if user is a student in the classroom
        if (!classroom.students.some(student => { var _a; return student.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to submit assignment', 403);
        }
        const assignment = classroom.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            throw new errorHandler_1.ApiError('Assignment not found', 404);
        }
        const submission = {
            studentId: req.user.id,
            submittedAt: new Date().toISOString(),
            files: req.body.files
        };
        // Update assignment submissions
        const updatedAssignments = classroom.assignments.map(a => {
            if (a.id === assignmentId) {
                return {
                    ...a,
                    submissions: [...a.submissions, submission]
                };
            }
            return a;
        });
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            assignments: updatedAssignments
        });
        // Notify about assignment submission
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'assignment_submitted', {
            classroomId: id,
            assignmentId,
            submission
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
exports.submitAssignment = submitAssignment;
const getClassrooms = async (req, res, next) => {
    var _a, _b, _c, _d;
    try {
        const { role = 'all' } = req.query;
        let query = {
            selector: {
                type: 'classroom'
            }
        };
        // Filter classrooms based on user role
        if (role === 'teacher') {
            query.selector['teacher.id'] = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        }
        else if (role === 'student') {
            query.selector['students'] = {
                $elemMatch: {
                    id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id
                }
            };
        }
        else {
            // For 'all', get both teaching and enrolled classrooms
            query = {
                selector: {
                    type: 'classroom',
                    $or: [
                        { 'teacher.id': (_c = req.user) === null || _c === void 0 ? void 0 : _c.id },
                        {
                            students: {
                                $elemMatch: {
                                    id: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id
                                }
                            }
                        }
                    ]
                }
            };
        }
        const classrooms = await database_1.DatabaseService.find(query);
        res.json({
            success: true,
            data: classrooms
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassrooms = getClassrooms;
//# sourceMappingURL=classroom.controller.js.map