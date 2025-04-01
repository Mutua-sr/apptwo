import { Classroom } from '../types/classroom';
export declare class ClassroomService {
    private static readonly TYPE;
    static createIndexes(): Promise<void>;
    static getByTeacher(teacherId: string): Promise<Classroom[]>;
    static getByStudent(studentId: string): Promise<Classroom[]>;
    static getAll(userId: string): Promise<Classroom[]>;
    static getActiveClassrooms(): Promise<Classroom[]>;
}
export default ClassroomService;
