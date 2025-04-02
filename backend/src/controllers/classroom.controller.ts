import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ClassroomService } from '../services/classroom.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';
import { 
  Classroom, 
  Assignment,
  Material,
  ClassroomStudent,
} from '../types/classroom';
import { ChatRoom } from '../types/chat';
import logger from '../config/logger';

type AuthenticatedRequest = Request & AuthRequest;

// Helper function to generate a unique classroom code
const generateClassroomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getClassrooms = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom[]>>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { role = 'all' } = req.query;
    let classrooms: Classroom[];

    switch (role) {
      case 'teacher':
        classrooms = await ClassroomService.getByTeacher(req.user.id);
        break;
      case 'student':
        classrooms = await ClassroomService.getByStudent(req.user.id);
        break;
      default:
        // Get both teacher and student classrooms
        const teacherClassrooms = await ClassroomService.getByTeacher(req.user.id);
        const studentClassrooms = await ClassroomService.getByStudent(req.user.id);
        classrooms = [...teacherClassrooms, ...studentClassrooms];
    }

    // Add real-time data like unread messages count
    const classroomsWithMeta = await Promise.all(
      classrooms.map(async (classroom) => ({
        ...classroom,
        unreadCount: 0 // Default to 0 since getUnreadCount is not available
      }))
    );

    res.json({
      success: true,
      data: classroomsWithMeta
    });
  } catch (error) {
    next(error);
  }
};

export const createClassroom = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    // Validate required fields
    if (!req.body.name?.trim()) {
      throw new ApiError('Name is required', 400);
    }
    if (!req.body.description?.trim()) {
      throw new ApiError('Description is required', 400);
    }

    // First create a chat room
    const chatRoomData = {
      type: 'chatroom',
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      participants: [{
        userId: req.user.id,
        name: req.user.name || '',
        avatar: req.user.avatar || '',
        role: 'admin',
        joinedAt: new Date().toISOString()
      }],
      settings: {
        isPrivate: false,
        allowReactions: true,
        allowAttachments: true,
        allowReplies: true,
        allowEditing: true,
        allowDeletion: true
      }
    };

    const chatRoom = await DatabaseService.create(chatRoomData);

    const classroomData: Omit<Classroom, '_id' | '_rev' | 'createdAt' | 'updatedAt'> & { chatRoomId: string } = {
      type: 'classroom',
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      code: generateClassroomCode(),
      chatRoomId: chatRoom._id,
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

    const classroom = await DatabaseService.create<Classroom>(classroomData);

    logger.info(`Classroom created: ${classroom._id} by teacher ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: classroom
    });
  } catch (error) {
    logger.error('Error creating classroom:', error);
    next(error);
  }
};

export const getClassroom = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Check if user has access to the classroom
    if (classroom.teacher.id !== req.user?.id && 
        !classroom.students.some(student => student.id === req.user?.id)) {
      throw new ApiError('Not authorized to access this classroom', 403);
    }

    res.json({
      success: true,
      data: {
        ...classroom,
        unreadCount: 0 // Default to 0 since getUnreadCount is not available
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClassroom = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Only teacher can update classroom
    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to update this classroom', 403);
    }

    const updateData: Partial<Classroom> = {
      ...(req.body.name && { name: req.body.name.trim() }),
      ...(req.body.description && { description: req.body.description.trim() }),
      ...(req.body.settings && { 
        settings: {
          allowStudentPosts: req.body.settings.allowStudentPosts ?? classroom.settings.allowStudentPosts,
          allowStudentComments: req.body.settings.allowStudentComments ?? classroom.settings.allowStudentComments,
          allowStudentChat: req.body.settings.allowStudentChat ?? classroom.settings.allowStudentChat,
          isArchived: req.body.settings.isArchived ?? classroom.settings.isArchived,
          notifications: {
            assignments: req.body.settings.notifications?.assignments ?? classroom.settings.notifications.assignments,
            materials: req.body.settings.notifications?.materials ?? classroom.settings.notifications.materials,
            announcements: req.body.settings.notifications?.announcements ?? classroom.settings.notifications.announcements
          }
        }
      })
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, updateData);

    // Notify about classroom update
    RealtimeService.getInstance().broadcastToRoom(id, 'classroom_updated', updatedClassroom);

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const joinClassroom = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { code } = req.params;
    
    // Find classroom by code
    const classrooms = await DatabaseService.find<Classroom>({
      selector: {
        type: 'classroom',
        code
      }
    });

    if (classrooms.length === 0) {
      throw new ApiError('Classroom not found', 404);
    }

    const classroom = classrooms[0];

    // Check if user is already a student
    if (classroom.students.some(student => student.id === req.user?.id)) {
      throw new ApiError('Already a member of this classroom', 400);
    }

    // Add student to classroom
    const newStudent: ClassroomStudent = {
      id: req.user!.id,
      name: req.user!.name,
      avatar: req.user?.avatar,
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(classroom._id, {
      students: [...classroom.students, newStudent]
    });

    // Add student to chat room if it exists
    if (classroom.chatRoomId) {
      const chatRoom = await DatabaseService.read<ChatRoom>(classroom.chatRoomId);
      if (chatRoom && chatRoom.type === 'chatroom') {
        await DatabaseService.update<ChatRoom>(classroom.chatRoomId, {
          participants: [...chatRoom.participants, {
            userId: req.user!.id,
            name: req.user!.name || '',
            avatar: req.user?.avatar || '',
            role: 'member',
            joinedAt: new Date().toISOString()
          }]
        });
      }
    }

    // Notify about new student
    RealtimeService.getInstance().broadcastToRoom(classroom._id, 'student_joined', {
      classroomId: classroom._id,
      student: newStudent
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const addAssignment = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Only teacher can add assignments
    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to add assignments', 403);
    }

    const assignment: Assignment = {
      id: `assignment_${Date.now()}`,
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      points: req.body.points,
      attachments: req.body.attachments || [],
      submissions: []
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      assignments: [...classroom.assignments, assignment]
    });

    // Notify about new assignment
    RealtimeService.getInstance().broadcastToRoom(id, 'new_assignment', {
      classroomId: id,
      assignment
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const addMaterial = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Only teacher can add materials
    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to add materials', 403);
    }

    const material: Material = {
      id: `material_${Date.now()}`,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      url: req.body.url,
      uploadedAt: new Date().toISOString(),
      tags: req.body.tags || []
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      materials: [...classroom.materials, material]
    });

    // Notify about new material
    RealtimeService.getInstance().broadcastToRoom(id, 'new_material', {
      classroomId: id,
      material
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClassroom = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ message: string }>>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to delete this classroom', 403);
    }

    await DatabaseService.delete(id);

    res.json({
      success: true,
      data: { message: 'Classroom deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};