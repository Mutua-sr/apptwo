import { Context } from '../../types';
import { Classroom, CreateClassroom, UpdateClassroomInput } from '../../types/classroom';
export declare const classroomResolvers: {
    Query: {
        classroom: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<any>;
        classrooms: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }, context: Context) => Promise<any>;
        myClassrooms: (_: any, __: any, context: Context) => Promise<Classroom[]>;
    };
    Mutation: {
        createClassroom: (_: any, { input }: {
            input: CreateClassroom;
        }, context: Context) => Promise<any>;
        updateClassroom: (_: any, { id, input }: {
            id: string;
            input: UpdateClassroomInput;
        }, context: Context) => Promise<any>;
        deleteClassroom: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<any>;
    };
    Classroom: {
        teacher: (parent: Classroom) => {
            id: string;
            name: string;
            avatar?: string;
        };
        students: (parent: Classroom) => import("../../types").ClassroomStudent[];
        assignments: (parent: Classroom) => import("../../types").Assignment[];
        materials: (parent: Classroom) => import("../../types").Material[];
        schedule: (parent: Classroom) => import("../../types").ScheduleEvent[];
    };
};
export default classroomResolvers;
