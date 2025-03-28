import { Context, CreatePost, UpdatePost, QueryOptions } from '../../types';
export declare const postResolvers: {
    Query: {
        post: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<import("../../types").Post | null>;
        posts: (_: any, options: QueryOptions, context: Context) => Promise<import("../../types").Post[]>;
        postsByTag: (_: any, { tag, ...options }: {
            tag: string;
        } & QueryOptions, context: Context) => Promise<import("../../types").Post[]>;
        postsByAuthor: (_: any, { authorId, ...options }: {
            authorId: string;
        } & QueryOptions, context: Context) => Promise<import("../../types").Post[]>;
        searchPosts: (_: any, { query, ...options }: {
            query: string;
        } & QueryOptions, context: Context) => Promise<import("../../types").Post[]>;
    };
    Mutation: {
        createPost: (_: any, { input }: {
            input: CreatePost;
        }, context: Context) => Promise<import("../../types").Post>;
        updatePost: (_: any, { id, input }: {
            id: string;
            input: UpdatePost;
        }, context: Context) => Promise<import("../../types").Post>;
        deletePost: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        likePost: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<import("../../types").Post>;
        unlikePost: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<import("../../types").Post>;
    };
    Post: {
        author: (parent: any) => any;
        tags: (parent: any) => any;
        likes: (parent: any) => any;
        comments: (parent: any) => any;
    };
};
export default postResolvers;
