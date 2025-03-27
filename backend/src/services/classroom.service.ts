import { Classroom, CreateClassroom, UpdateClassroomInput, ClassroomSettings } from '../types/classroom';
import { DatabaseService } from './database';
import logger from '../config/logger';

export class ClassroomService {
  private static readonly TYPE = 'classroom' as const;

  static async create(input: CreateClassroom): Promise<Classroom> {
    try {
      const defaultSettings: ClassroomSettings = {
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

      return await DatabaseService.create<Classroom>(classroom);
    } catch (error) {
      logger.error('Error creating classroom:', error);
      throw new Error('Failed to create classroom');
    }
  }

  static async getById(id: string): Promise<Classroom | null> {
    try {
      return await DatabaseService.read<Classroom>(id);
    } catch (error) {
      logger.error(`Error getting classroom ${id}:`, error);
      throw new Error('Failed to get classroom');
    }
  }

  static async list(page: number = 1, limit: number = 10): Promise<Classroom[]> {
    try {
      const skip = (page - 1) * limit;
      const query = {
        selector: {
          type: this.TYPE
        },
        sort: [{ createdAt: 'desc' as const }],
        skip,
        limit
      };

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error('Error listing classrooms:', error);
      throw new Error('Failed to list classrooms');
    }
  }

  static async update(id: string, input: UpdateClassroomInput): Promise<Classroom> {
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

      return await DatabaseService.update<Classroom>(id, updateData);
    } catch (error) {
      logger.error(`Error updating classroom ${id}:`, error);
      throw new Error('Failed to update classroom');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      return await DatabaseService.delete(id);
    } catch (error) {
      logger.error(`Error deleting classroom ${id}:`, error);
      throw new Error('Failed to delete classroom');
    }
  }

  static async getByTeacher(teacherId: string): Promise<Classroom[]> {
    try {
      const query = {
        selector: {
          type: this.TYPE,
          'teacher.id': teacherId
        },
        sort: [{ createdAt: 'desc' as const }]
      };

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error(`Error getting classrooms for teacher ${teacherId}:`, error);
      throw new Error('Failed to get classrooms by teacher');
    }
  }

  static async getByStudent(studentId: string): Promise<Classroom[]> {
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
        sort: [{ createdAt: 'desc' as const }]
      };

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error(`Error getting classrooms for student ${studentId}:`, error);
      throw new Error('Failed to get classrooms by student');
    }
  }

  static async addStudent(classroomId: string, student: { id: string; name: string; avatar?: string }): Promise<Classroom> {
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
        status: 'active' as const
      };

      const updatedClassroom = {
        ...classroom,
        students: [...classroom.students, newStudent]
      };

      return await DatabaseService.update<Classroom>(classroomId, updatedClassroom);
    } catch (error) {
      logger.error(`Error adding student to classroom ${classroomId}:`, error);
      throw new Error('Failed to add student to classroom');
    }
  }

  static async removeStudent(classroomId: string, studentId: string): Promise<Classroom> {
    try {
      const classroom = await this.getById(classroomId);
      if (!classroom) {
        throw new Error('Classroom not found');
      }

      const updatedClassroom = {
        ...classroom,
        students: classroom.students.filter(s => s.id !== studentId)
      };

      return await DatabaseService.update<Classroom>(classroomId, updatedClassroom);
    } catch (error) {
      logger.error(`Error removing student from classroom ${classroomId}:`, error);
      throw new Error('Failed to remove student from classroom');
    }
  }
}

export default ClassroomService;