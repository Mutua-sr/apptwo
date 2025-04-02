import { Community, Post } from '../types';
declare const resolvers: {
    Query: {
        classrooms: (_: any, { page, limit }: {
            page: number;
            limit: number;
        }) => Promise<Classroom[]>;
        classroom: (_: any, { id }: {
            id: string;
        }) => Promise<any>;
        communities: (_: any, { page, limit }: {
            page: number;
            limit: number;
        }) => Promise<Community[]>;
        community: (_: any, { id }: {
            id: string;
        }) => Promise<Community | null>;
        posts: (_: any, { page, limit }: {
            page: number;
            limit: number;
        }) => Promise<Post[]>;
        post: (_: any, { id }: {
            id: string;
        }) => Promise<Post | null>;
        postsByTag: (_: any, { tag }: {
            tag: string;
        }) => Promise<(Post & {
            _id: string;
            _rev?: string;
            createdAt: string;
            updatedAt: string;
        })[]>;
    };
    Mutation: {
        createClassroom: (_: any, { input }: any) => Promise<Classroom>;
        updateClassroom: (_: any, { id, input }: any) => Promise<Classroom>;
        deleteClassroom: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
        createCommunity: (_: any, { input }: any) => Promise<Community>;
        updateCommunity: (_: any, { id, input }: any) => Promise<Community>;
        deleteCommunity: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
        createPost: (_: any, { input }: any) => Promise<Post>;
        updatePost: (_: any, { id, input }: any) => Promise<Post>;
        deletePost: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
    };
};
export default resolvers;
