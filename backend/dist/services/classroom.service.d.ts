import { Classroom, CreateClassroom, UpdateClassroomInput } from '../types/classroom';
export declare class ClassroomService {
    private static readonly TYPE;
    static create(input: CreateClassroom): Promise<Classroom>;
    static getById(id: string): Promise<Classroom | null>;
    static list(page?: number, limit?: number): Promise<Classroom[]>;
    static update(id: string, input: UpdateClassroomInput): Promise<Classroom>;
    static delete(id: string): Promise<boolean>;
    static getByTeacher(teacherId: string): Promise<Classroom[]>;
    static getByStudent(studentId: string): Promise<Classroom[]>;
    static addStudent(classroomId: string, student: {
        id: string;
        name: string;
        avatar?: string;
    }): Promise<Classroom>;
    static removeStudent(classroomId: string, studentId: string): Promise<Classroom>;
}
export default ClassroomService;
