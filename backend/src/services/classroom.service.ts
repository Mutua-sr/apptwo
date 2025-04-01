import { DatabaseService } from './database';
import { Classroom, CreateClassroom, UpdateClassroomInput } from '../types/classroom';
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
      const query: DatabaseQuery = {
        selector: {
          type: this.TYPE,
          'settings.isArchived': false
        },
        use_index: 'active-classrooms-index',
        sort: [{ updatedAt: 'desc' }]
      };

      const skip = (page - 1) * limit;
      const results = await DatabaseService.find<Classroom>(query);
      return results.slice(skip, skip + limit);
    } catch (error) {
      logger.error('Error listing classrooms:', error);
      throw new Error('Failed to list classrooms');
    }
  }

  static async create(data: CreateClassroom): Promise<Classroom> {
    try {
      const classroom: Omit<Classroom, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
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

      return await DatabaseService.create<Classroom>(classroom);
    } catch (error) {
      logger.error('Error creating classroom:', error);
      throw new Error('Failed to create classroom');
    }
  }

  static async update(id: string, data: UpdateClassroomInput): Promise<Classroom> {
    try {
      const existing = await DatabaseService.read<Classroom>(id);
      if (!existing) {
        throw new Error('Classroom not found');
      }

      const updateData: Partial<Classroom> = {
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

      return await DatabaseService.update<Classroom>(id, updateData);
    } catch (error) {
      logger.error(`Error updating classroom ${id}:`, error);
      throw new Error('Failed to update classroom');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await DatabaseService.delete(id);
      return true;
    } catch (error) {
      logger.error(`Error deleting classroom ${id}:`, error);
      throw new Error('Failed to delete classroom');
    }
  }

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
}

export default ClassroomService;
