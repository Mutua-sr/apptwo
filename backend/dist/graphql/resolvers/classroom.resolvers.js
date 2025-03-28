"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classroomResolvers = void 0;
const classroom_service_1 = __importDefault(require("../../services/classroom.service"));
const logger_1 = __importDefault(require("../../config/logger"));
exports.classroomResolvers = {
    Query: {
        classroom: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await classroom_service_1.default.getById(id);
            }
            catch (error) {
                logger_1.default.error(`Error in classroom query: ${error}`);
                throw error;
            }
        },
        classrooms: async (_, { page, limit }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await classroom_service_1.default.list(page, limit);
            }
            catch (error) {
                logger_1.default.error(`Error in classrooms query: ${error}`);
                throw error;
            }
        },
        myClassrooms: async (_, __, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                return await classroom_service_1.default.getByTeacher(context.user.id);
            }
            catch (error) {
                logger_1.default.error(`Error in myClassrooms query: ${error}`);
                throw error;
            }
        }
    },
    Mutation: {
        createClassroom: async (_, { input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                if (context.user.role !== 'teacher' && context.user.role !== 'admin') {
                    throw new Error('Only teachers can create classrooms');
                }
                const classroomInput = {
                    type: 'classroom',
                    name: input.name,
                    description: input.description,
                    teacher: {
                        id: context.user.id,
                        name: context.user.name,
                        avatar: context.user.avatar
                    }
                };
                return await classroom_service_1.default.create(classroomInput);
            }
            catch (error) {
                logger_1.default.error(`Error in createClassroom mutation: ${error}`);
                throw error;
            }
        },
        updateClassroom: async (_, { id, input }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const classroom = await classroom_service_1.default.getById(id);
                if (!classroom) {
                    throw new Error('Classroom not found');
                }
                if (classroom.teacher.id !== context.user.id && context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await classroom_service_1.default.update(id, input);
            }
            catch (error) {
                logger_1.default.error(`Error in updateClassroom mutation: ${error}`);
                throw error;
            }
        },
        deleteClassroom: async (_, { id }, context) => {
            try {
                if (!context.user) {
                    throw new Error('Authentication required');
                }
                const classroom = await classroom_service_1.default.getById(id);
                if (!classroom) {
                    throw new Error('Classroom not found');
                }
                if (classroom.teacher.id !== context.user.id && context.user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                return await classroom_service_1.default.delete(id);
            }
            catch (error) {
                logger_1.default.error(`Error in deleteClassroom mutation: ${error}`);
                throw error;
            }
        }
    },
    Classroom: {
        // Field resolvers if needed
        teacher: (parent) => parent.teacher,
        students: (parent) => parent.students || [],
        assignments: (parent) => parent.assignments || [],
        materials: (parent) => parent.materials || [],
        schedule: (parent) => parent.schedule || []
    }
};
exports.default = exports.classroomResolvers;
//# sourceMappingURL=classroom.resolvers.js.map