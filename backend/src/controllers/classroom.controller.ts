import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';
import { 
  Classroom, 
  Assignment,
  Material,
  ClassroomStudent,
  AssignmentSubmission
} from '../types/classroom';
import logger from '../config/logger';

type AuthenticatedRequest = Request & AuthRequest;

// Helper function to generate a unique classroom code
const generateClassroomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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

    const classroomData: Omit<Classroom, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
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
      data: classroom
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

export const addScheduleEvent = async (
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

    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to add schedule events', 403);
    }

    const event = {
      id: `event_${Date.now()}`,
      title: req.body.title,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      recurring: req.body.recurring
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      schedule: [...classroom.schedule, event]
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { classroomId, assignmentId, studentId } = req.params;
    const classroom = await DatabaseService.read<Classroom>(classroomId);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to grade submissions', 403);
    }

    const assignment = classroom.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new ApiError('Assignment not found', 404);
    }

    const submission = assignment.submissions.find(s => s.studentId === studentId);
    if (!submission) {
      throw new ApiError('Submission not found', 404);
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

    const updatedClassroom = await DatabaseService.update<Classroom>(classroomId, {
      assignments: updatedAssignments
    });

    // Notify student about grade
    RealtimeService.getInstance().emitToUser(studentId, 'assignment_graded', {
      classroomId,
      assignmentId,
      grade: req.body.grade,
      feedback: req.body.feedback
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom>>,
  next: NextFunction
) => {
  try {
    const { id, assignmentId } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Check if user is a student in the classroom
    if (!classroom.students.some(student => student.id === req.user?.id)) {
      throw new ApiError('Not authorized to submit assignment', 403);
    }

    const assignment = classroom.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new ApiError('Assignment not found', 404);
    }

    const submission: AssignmentSubmission = {
      studentId: req.user!.id,
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

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      assignments: updatedAssignments
    });

    // Notify about assignment submission
    RealtimeService.getInstance().broadcastToRoom(id, 'assignment_submitted', {
      classroomId: id,
      assignmentId,
      submission
    });

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const getClassrooms = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Classroom[]>>,
  next: NextFunction
) => {
  try {
    const { role = 'all' } = req.query;
    let query: any = {
      selector: {
        type: 'classroom'
      }
    };

    // Filter classrooms based on user role
    if (role === 'teacher') {
      query.selector['teacher.id'] = req.user?.id;
    } else if (role === 'student') {
      query.selector['students'] = {
        $elemMatch: {
          id: req.user?.id
        }
      };
    } else {
      // For 'all', get both teaching and enrolled classrooms
      query = {
        selector: {
          type: 'classroom',
          $or: [
            { 'teacher.id': req.user?.id },
            {
              students: {
                $elemMatch: {
                  id: req.user?.id
                }
              }
            }
          ]
        }
      };
    }

    const classrooms = await DatabaseService.find<Classroom>(query);

    res.json({
      success: true,
      data: classrooms
    });
  } catch (error) {
    next(error);
  }
};