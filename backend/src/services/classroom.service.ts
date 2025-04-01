import { DatabaseService } from './database';
import { Classroom, ClassroomSettings } from '../types/classroom';
import logger from '../config/logger';

interface DatabaseQuery {
  selector: {
    type: string;
    [key: string]: any;
  };
  use_index?: string;
  sort?: Array<{ [key: string]: 'asc' | 'desc' }>;
}

export class ClassroomService {
  private static readonly TYPE = 'classroom' as const;

  static async createIndexes() {
    try {
      // Create index for classrooms by teacher
      await DatabaseService.find({
        selector: {
          type: this.TYPE,
          'teacher.id': { $exists: true }
        },
        use_index: 'classrooms-by-teacher-index'
      });

      // Create index for classrooms by student
      await DatabaseService.find({
        selector: {
          type: this.TYPE,
          'students.id': { $exists: true }
        },
        use_index: 'classrooms-by-student-index'
      });

      // Create index for active classrooms
      await DatabaseService.find({
        selector: {
          type: this.TYPE,
          'settings.isArchived': { $exists: true }
        },
        use_index: 'active-classrooms-index'
      });

      logger.info('Created classroom indexes');
    } catch (error) {
      logger.error('Error creating classroom indexes:', error);
    }
  }

  static async getByTeacher(teacherId: string): Promise<Classroom[]> {
    try {
      const query: DatabaseQuery = {
        selector: {
          type: this.TYPE,
          'teacher.id': teacherId,
          'settings.isArchived': false
        },
        use_index: 'classrooms-by-teacher-index',
        sort: [{ updatedAt: 'desc' }]
      };

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error(`Error getting classrooms for teacher ${teacherId}:`, error);
      throw new Error('Failed to get classrooms by teacher');
    }
  }

  static async getByStudent(studentId: string): Promise<Classroom[]> {
    try {
      const query: DatabaseQuery = {
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

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error(`Error getting classrooms for student ${studentId}:`, error);
      throw new Error('Failed to get classrooms by student');
    }
  }

  static async getAll(userId: string): Promise<Classroom[]> {
    try {
      const query: DatabaseQuery = {
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

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error('Error getting all classrooms:', error);
      throw new Error('Failed to get classrooms');
    }
  }

  static async getActiveClassrooms(): Promise<Classroom[]> {
    try {
      const query: DatabaseQuery = {
        selector: {
          type: this.TYPE,
          'settings.isArchived': false
        },
        use_index: 'active-classrooms-index',
        sort: [{ updatedAt: 'desc' }]
      };

      return await DatabaseService.find<Classroom>(query);
    } catch (error) {
      logger.error('Error getting active classrooms:', error);
      throw new Error('Failed to get active classrooms');
    }
  }
}

export default ClassroomService;