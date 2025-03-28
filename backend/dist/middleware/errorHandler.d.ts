import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class DatabaseError extends ApiError {
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare const notFound: (req: Request, _: Response, next: NextFunction) => void;
export declare const errorHandler: (err: ApiError, req: Request, res: Response, _: NextFunction) => void;
