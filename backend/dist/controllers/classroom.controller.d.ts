import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { Classroom } from '../types/classroom';
type AuthenticatedRequest = Request & AuthRequest;
export declare const getClassrooms: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom[]>>, next: NextFunction) => Promise<void>;
export declare const createClassroom: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const getClassroom: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const updateClassroom: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const joinClassroom: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const addAssignment: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const addMaterial: (req: AuthenticatedRequest, res: Response<ApiResponse<Classroom>>, next: NextFunction) => Promise<void>;
export declare const deleteClassroom: (req: AuthenticatedRequest, res: Response<ApiResponse<{
    message: string;
}>>, next: NextFunction) => Promise<void>;
export {};
