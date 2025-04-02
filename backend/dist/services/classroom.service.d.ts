import { Classroom, CreateClassroom, UpdateClassroomInput } from '../types/classroom';
export declare class ClassroomService {
    private static readonly TYPE;
    static getById(id: string): Promise<Classroom | null>;
    static list(page?: number, limit?: number): Promise<Classroom[]>;
    static create(data: CreateClassroom): Promise<Classroom>;
    static update(id: string, data: UpdateClassroomInput): Promise<Classroom>;
    static delete(id: string): Promise<boolean>;
    static getByTeacher(teacherId: string): Promise<Classroom[]>;
    static getByStudent(studentId: string): Promise<Classroom[]>;
    static getActiveClassrooms(): Promise<Classroom[]>;
    static getAll(userId: string): Promise<Classroom[]>;
}
export default ClassroomService;
