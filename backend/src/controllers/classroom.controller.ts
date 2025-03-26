import { Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, Classroom, CreateClassroom } from '../types';

export const createClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      const error = new Error('Name is required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (!req.user?.id) {
      const error = new Error('User not authenticated') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const classroomData: CreateClassroom = {
      type: 'classroom',
      name,
      description,
      instructor: req.user.id,
      students: [],
      topics: []
    };

    const classroom = await DatabaseService.create<Classroom>(classroomData);

    res.status(201).json({
      success: true,
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

export const getClassrooms = async (
  req: AuthRequest,
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

export const getClassroom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      const error = new Error('Classroom not found') as ApiError;
      error.statusCode = 404;
      throw error;
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
    const { name, description, topics, students } = req.body;

    const classroom = await DatabaseService.read<Classroom>(id);

    if (!classroom) {
      const error = new Error('Classroom not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (classroom.instructor !== req.user?.id) {
      const error = new Error('Not authorized to update this classroom') as ApiError;
      error.statusCode = 403;
      throw error;
    }

    const updatedClassroom = await DatabaseService.update<Classroom>(id, {
      name: name || classroom.name,
      description: description || classroom.description,
      topics: topics || classroom.topics,
      students: students || classroom.students
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
      const error = new Error('Classroom not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    if (classroom.instructor !== req.user?.id) {
      const error = new Error('Not authorized to delete this classroom') as ApiError;
      error.statusCode = 403;
      throw error;
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