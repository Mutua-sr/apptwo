import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { RealtimeService } from '../services/realtime.service';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { 
  Classroom, 
  Assignment, 
  Material, 
  ScheduleEvent,
  ClassroomStudent
} from '../types/classroom';

export const getClassrooms = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const classrooms = await DatabaseService.find<Classroom>({
      selector: {
        type: 'classroom'
      }
    });

    res.json({
      success: true,
      data: classrooms
    });
  } catch (error) {
    next(error);
  }
};

export const createClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    const classroom = await DatabaseService.create<Classroom>({
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
  } catch (error) {
    next(error);
  }
};

export const getClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to update this classroom', 403);
    }

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      ...req.body,
      updatedAt: new Date().toISOString()
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
  req: AuthRequest,
  res: Response,
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
      message: 'Classroom deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const joinClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;
    if (!code) {
      throw new ApiError('Classroom code is required', 400);
    }

    const classrooms = await DatabaseService.find<Classroom>({
      selector: {
        type: 'classroom',
        code
      }
    });

    const classroom = classrooms[0];
    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    if (classroom.students.some(student => student.id === req.user?.id)) {
      throw new ApiError('Already a member of this classroom', 400);
    }

    const newStudent: ClassroomStudent = {
      id: req.user!.id,
      name: req.user!.name,
      avatar: req.user!.avatar,
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(classroom._id, {
      students: [...classroom.students, newStudent]
    });

    // Notify about new student
    RealtimeService.getInstance().emitToUser(
      classroom.teacher.id,
      'student_joined',
      {
        classroomId: classroom._id,
        student: newStudent
      }
    );

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const addAssignment = async (
  req: AuthRequest,
  res: Response,
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
      id: Math.random().toString(36).substring(7),
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      points: req.body.points,
      attachments: req.body.attachments,
      submissions: []
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      assignments: [...classroom.assignments, assignment]
    });

    // Notify about new assignment
    RealtimeService.getInstance().broadcastToRoom(id, 'assignment_added', {
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
  req: AuthRequest,
  res: Response,
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
      id: Math.random().toString(36).substring(7),
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
    RealtimeService.getInstance().broadcastToRoom(id, 'material_added', {
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

export const addScheduleEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Only teacher can add schedule events
    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to add schedule events', 403);
    }

    const event: ScheduleEvent = {
      id: Math.random().toString(36).substring(7),
      title: req.body.title,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      recurring: req.body.recurring
    };

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      schedule: [...classroom.schedule, event]
    });

    // Notify about new schedule event
    RealtimeService.getInstance().broadcastToRoom(id, 'schedule_event_added', {
      classroomId: id,
      event
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { classroomId, assignmentId } = req.params;
    const classroom = await DatabaseService.read<Classroom>(classroomId);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Check if user is a student in the classroom
    if (!classroom.students.some(s => s.id === req.user?.id)) {
      throw new ApiError('Not authorized to submit to this assignment', 403);
    }

    const assignment = classroom.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new ApiError('Assignment not found', 404);
    }

    // Check if already submitted
    if (assignment.submissions.some(s => s.studentId === req.user?.id)) {
      throw new ApiError('Already submitted this assignment', 400);
    }

    const submission = {
      studentId: req.user!.id,
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

    const updatedClassroom = await DatabaseService.update<Classroom>(classroomId, {
      assignments: updatedAssignments
    });

    // Notify about new submission
    RealtimeService.getInstance().emitToUser(
      classroom.teacher.id,
      'assignment_submitted',
      {
        classroomId,
        assignmentId,
        submission
      }
    );

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { classroomId, assignmentId, studentId } = req.params;
    const classroom = await DatabaseService.read<Classroom>(classroomId);

    if (!classroom) {
      throw new ApiError('Classroom not found', 404);
    }

    // Only teacher can grade submissions
    if (classroom.teacher.id !== req.user?.id) {
      throw new ApiError('Not authorized to grade submissions', 403);
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
    RealtimeService.getInstance().emitToUser(
      studentId,
      'assignment_graded',
      {
        classroomId,
        assignmentId,
        grade: req.body.grade,
        feedback: req.body.feedback
      }
    );

    res.json({
      success: true,
      data: updatedClassroom
    });
  } catch (error) {
    next(error);
  }
};