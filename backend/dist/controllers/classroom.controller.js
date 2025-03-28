"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmission = exports.submitAssignment = exports.addScheduleEvent = exports.addMaterial = exports.addAssignment = exports.joinClassroom = exports.deleteClassroom = exports.updateClassroom = exports.getClassroom = exports.createClassroom = exports.getClassrooms = void 0;
const database_1 = require("../services/database");
const realtime_service_1 = require("../services/realtime.service");
const errorHandler_1 = require("../middleware/errorHandler");
const getClassrooms = async (_req, res, next) => {
    try {
        const classrooms = await database_1.DatabaseService.find({
            selector: {
                type: 'classroom'
            }
        });
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
const createClassroom = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError('Authentication required', 401);
        }
        const classroom = await database_1.DatabaseService.create({
            type: 'classroom',
            name: req.body.name,
            description: req.body.description,
            code: Math.random().toString(36).substring(7).toUpperCase(),
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
        });
        res.status(201).json({
            success: true,
            data: classroom
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createClassroom = createClassroom;
const getClassroom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
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
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to update this classroom', 403);
        }
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            ...req.body,
            updatedAt: new Date().toISOString()
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
exports.updateClassroom = updateClassroom;
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
            message: 'Classroom deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClassroom = deleteClassroom;
const joinClassroom = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            throw new errorHandler_1.ApiError('Classroom code is required', 400);
        }
        const classrooms = await database_1.DatabaseService.find({
            selector: {
                type: 'classroom',
                code
            }
        });
        const classroom = classrooms[0];
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        if (classroom.students.some(student => { var _a; return student.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Already a member of this classroom', 400);
        }
        const newStudent = {
            id: req.user.id,
            name: req.user.name,
            avatar: req.user.avatar,
            joinedAt: new Date().toISOString(),
            status: 'active'
        };
        const updatedClassroom = await database_1.DatabaseService.update(classroom._id, {
            students: [...classroom.students, newStudent]
        });
        // Notify about new student
        realtime_service_1.RealtimeService.getInstance().emitToUser(classroom.teacher.id, 'student_joined', {
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
            id: Math.random().toString(36).substring(7),
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            points: req.body.points,
            attachments: req.body.attachments,
            submissions: []
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            assignments: [...classroom.assignments, assignment]
        });
        // Notify about new assignment
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'assignment_added', {
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
            id: Math.random().toString(36).substring(7),
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
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'material_added', {
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
const addScheduleEvent = async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const classroom = await database_1.DatabaseService.read(id);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Only teacher can add schedule events
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to add schedule events', 403);
        }
        const event = {
            id: Math.random().toString(36).substring(7),
            title: req.body.title,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            recurring: req.body.recurring
        };
        const updatedClassroom = await database_1.DatabaseService.update(id, {
            schedule: [...classroom.schedule, event]
        });
        // Notify about new schedule event
        realtime_service_1.RealtimeService.getInstance().broadcastToRoom(id, 'schedule_event_added', {
            classroomId: id,
            event
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
const submitAssignment = async (req, res, next) => {
    try {
        const { classroomId, assignmentId } = req.params;
        const classroom = await database_1.DatabaseService.read(classroomId);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Check if user is a student in the classroom
        if (!classroom.students.some(s => { var _a; return s.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Not authorized to submit to this assignment', 403);
        }
        const assignment = classroom.assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            throw new errorHandler_1.ApiError('Assignment not found', 404);
        }
        // Check if already submitted
        if (assignment.submissions.some(s => { var _a; return s.studentId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); })) {
            throw new errorHandler_1.ApiError('Already submitted this assignment', 400);
        }
        const submission = {
            studentId: req.user.id,
            submittedAt: new Date().toISOString(),
            files: req.body.files
        };
        const updatedAssignments = classroom.assignments.map(a => {
            if (a.id === assignmentId) {
                return {
                    ...a,
                    submissions: [...a.submissions, submission]
                };
            }
            return a;
        });
        const updatedClassroom = await database_1.DatabaseService.update(classroomId, {
            assignments: updatedAssignments
        });
        // Notify about new submission
        realtime_service_1.RealtimeService.getInstance().emitToUser(classroom.teacher.id, 'assignment_submitted', {
            classroomId,
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
const gradeSubmission = async (req, res, next) => {
    var _a;
    try {
        const { classroomId, assignmentId, studentId } = req.params;
        const classroom = await database_1.DatabaseService.read(classroomId);
        if (!classroom) {
            throw new errorHandler_1.ApiError('Classroom not found', 404);
        }
        // Only teacher can grade submissions
        if (classroom.teacher.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new errorHandler_1.ApiError('Not authorized to grade submissions', 403);
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
//# sourceMappingURL=classroom.controller.js.map