import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export interface CouchDBDocument {
    _id: string;
    _rev: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}
export interface AuthUser {
    id: string;
    profileId: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}
export interface User extends CouchDBDocument {
    type: 'user';
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
}
export interface CreateUser {
    type: 'user';
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
}
export interface AuthRequest extends Request {
    user?: AuthUser;
}
export interface JWTPayload extends JwtPayload {
    id: string;
    profileId: string;
    role: UserRole;
}
export interface MangoQuery {
    selector: {
        [key: string]: any;
    };
    limit?: number;
    skip?: number;
    sort?: SortOrder[];
}
export interface SortOrder {
    [key: string]: 'asc' | 'desc';
}
export interface QueryOptions {
    page?: number;
    limit?: number;
    skip?: number;
    sort?: SortOrder[];
    search?: string;
}
export interface Context {
    user?: AuthUser;
}
export * from './community';
export * from './feed';
export * from './chat';
export * from './profile';
export * from './video';
export * from './webrtc';
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}
export interface ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: any;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
export type UserRole = 'student' | 'admin';
export declare const UserRole: {
    STUDENT: UserRole;
    ADMIN: UserRole;
};
