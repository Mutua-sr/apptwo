declare const resolvers: {
    Query: {
        post: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Post | null>;
        posts: (_: any, options: import("../../types").QueryOptions, context: import("../../types").Context) => Promise<import("../../types").Post[]>;
        postsByTag: (_: any, { tag, ...options }: {
            tag: string;
        } & import("../../types").QueryOptions, context: import("../../types").Context) => Promise<import("../../types").Post[]>;
        postsByAuthor: (_: any, { authorId, ...options }: {
            authorId: string;
        } & import("../../types").QueryOptions, context: import("../../types").Context) => Promise<import("../../types").Post[]>;
        searchPosts: (_: any, { query, ...options }: {
            query: string;
        } & import("../../types").QueryOptions, context: import("../../types").Context) => Promise<import("../../types").Post[]>;
        community: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Community | null>;
        communities: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }, context: import("../../types").Context) => Promise<import("../../types").Community[]>;
        searchCommunities: (_: any, { query, page, limit }: {
            query: string;
            page?: number;
            limit?: number;
        }, context: import("../../types").Context) => Promise<import("../../types").Community[]>;
        classroom: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Classroom | null>;
        classrooms: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }, context: import("../../types").Context) => Promise<import("../../types").Classroom[]>;
        myClassrooms: (_: any, __: any, context: import("../../types").Context) => Promise<import("../../types").Classroom[]>;
    };
    Mutation: {
        createPost: (_: any, { input }: {
            input: import("../../types").CreatePost;
        }, context: import("../../types").Context) => Promise<import("../../types").Post>;
        updatePost: (_: any, { id, input }: {
            id: string;
            input: import("../../types").UpdatePost;
        }, context: import("../../types").Context) => Promise<import("../../types").Post>;
        deletePost: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<boolean>;
        likePost: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Post>;
        unlikePost: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Post>;
        createCommunity: (_: any, { input }: {
            input: import("../../types").CreateCommunity;
        }, context: import("../../types").Context) => Promise<import("../../types").Community>;
        updateCommunity: (_: any, { id, input }: {
            id: string;
            input: import("../../types").UpdateCommunity;
        }, context: import("../../types").Context) => Promise<import("../../types").Community>;
        deleteCommunity: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<boolean>;
        addCommunityTopic: (_: any, { id, topic }: {
            id: string;
            topic: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Community>;
        removeCommunityTopic: (_: any, { id, topic }: {
            id: string;
            topic: string;
        }, context: import("../../types").Context) => Promise<import("../../types").Community>;
        createClassroom: (_: any, { input }: {
            input: import("../../types").CreateClassroom;
        }, context: import("../../types").Context) => Promise<import("../../types").Classroom>;
        updateClassroom: (_: any, { id, input }: {
            id: string;
            input: import("../../types").UpdateClassroomInput;
        }, context: import("../../types").Context) => Promise<import("../../types").Classroom>;
        deleteClassroom: (_: any, { id }: {
            id: string;
        }, context: import("../../types").Context) => Promise<boolean>;
    };
    Classroom: {
        teacher: (parent: import("../../types").Classroom) => {
            id: string;
            name: string;
            avatar?: string;
        };
        students: (parent: import("../../types").Classroom) => import("../../types").ClassroomStudent[];
        assignments: (parent: import("../../types").Classroom) => import("../../types").Assignment[];
        materials: (parent: import("../../types").Classroom) => import("../../types").Material[];
        schedule: (parent: import("../../types").Classroom) => import("../../types").ScheduleEvent[];
    };
    Community: {
        topics: (parent: any) => any;
        members: (parent: any) => any;
    };
    Post: {
        author: (parent: any) => any;
        tags: (parent: any) => any;
        likes: (parent: any) => any;
        comments: (parent: any) => any;
    };
    Date: {
        serialize(value: any): any;
        parseValue(value: any): Date;
        parseLiteral(ast: any): Date | null;
    };
};
export default resolvers;
