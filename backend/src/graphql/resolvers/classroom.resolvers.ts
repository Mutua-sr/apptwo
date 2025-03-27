import { Context } from '../../types';
import { Classroom, CreateClassroom, UpdateClassroomInput } from '../../types/classroom';
import ClassroomService from '../../services/classroom.service';
import logger from '../../config/logger';

export const classroomResolvers = {
  Query: {
    classroom: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        return await ClassroomService.getById(id);
      } catch (error) {
        logger.error(`Error in classroom query: ${error}`);
        throw error;
      }
    },

    classrooms: async (_: any, { page, limit }: { page?: number; limit?: number }, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        return await ClassroomService.list(page, limit);
      } catch (error) {
        logger.error(`Error in classrooms query: ${error}`);
        throw error;
      }
    },

    myClassrooms: async (_: any, __: any, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        return await ClassroomService.getByTeacher(context.user.id);
      } catch (error) {
        logger.error(`Error in myClassrooms query: ${error}`);
        throw error;
      }
    }
  },

  Mutation: {
    createClassroom: async (_: any, { input }: { input: CreateClassroom }, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        if (context.user.role !== 'teacher' && context.user.role !== 'admin') {
          throw new Error('Only teachers can create classrooms');
        }

        const classroomInput: CreateClassroom = {
          type: 'classroom',
          name: input.name,
          description: input.description,
          teacher: {
            id: context.user.id,
            name: context.user.name,
            avatar: context.user.avatar
          }
        };

        return await ClassroomService.create(classroomInput);
      } catch (error) {
        logger.error(`Error in createClassroom mutation: ${error}`);
        throw error;
      }
    },

    updateClassroom: async (_: any, { id, input }: { id: string; input: UpdateClassroomInput }, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        const classroom = await ClassroomService.getById(id);
        if (!classroom) {
          throw new Error('Classroom not found');
        }
        if (classroom.teacher.id !== context.user.id && context.user.role !== 'admin') {
          throw new Error('Not authorized');
        }

        return await ClassroomService.update(id, input);
      } catch (error) {
        logger.error(`Error in updateClassroom mutation: ${error}`);
        throw error;
      }
    },

    deleteClassroom: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        if (!context.user) {
          throw new Error('Authentication required');
        }
        const classroom = await ClassroomService.getById(id);
        if (!classroom) {
          throw new Error('Classroom not found');
        }
        if (classroom.teacher.id !== context.user.id && context.user.role !== 'admin') {
          throw new Error('Not authorized');
        }
        return await ClassroomService.delete(id);
      } catch (error) {
        logger.error(`Error in deleteClassroom mutation: ${error}`);
        throw error;
      }
    }
  },

  Classroom: {
    // Field resolvers if needed
    teacher: (parent: Classroom) => parent.teacher,
    students: (parent: Classroom) => parent.students || [],
    assignments: (parent: Classroom) => parent.assignments || [],
    materials: (parent: Classroom) => parent.materials || [],
    schedule: (parent: Classroom) => parent.schedule || []
  }
};

export default classroomResolvers;