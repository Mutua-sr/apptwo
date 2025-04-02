import { Community, CreateCommunity } from '../types/community';
import { Post, CreatePost } from '../types/feed';
declare const resolvers: {
    Query: {
        community: (_: any, { id }: {
            id: string;
        }) => Promise<Community | null>;
        communities: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }) => Promise<(Community & {
            _id: string;
            _rev?: string;
            createdAt: string;
            updatedAt: string;
        })[]>;
        post: (_: any, { id }: {
            id: string;
        }) => Promise<Post | null>;
        posts: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }) => Promise<(Post & {
            _id: string;
            _rev?: string;
            createdAt: string;
            updatedAt: string;
        })[]>;
    };
    Mutation: {
        createCommunity: (_: any, { input }: {
            input: Partial<CreateCommunity>;
        }) => Promise<Community>;
        updateCommunity: (_: any, { id, input }: {
            id: string;
            input: Partial<Community>;
        }) => Promise<Community>;
        deleteCommunity: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
        createPost: (_: any, { input }: {
            input: CreatePost;
        }) => Promise<Post>;
        updatePost: (_: any, { id, input }: {
            id: string;
            input: Partial<Post>;
        }) => Promise<Post>;
        deletePost: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
    };
};
export default resolvers;
