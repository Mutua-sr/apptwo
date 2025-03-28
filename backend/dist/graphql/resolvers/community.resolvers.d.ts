import { Context, CreateCommunity, UpdateCommunity } from '../../types';
export declare const communityResolvers: {
    Query: {
        community: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<import("../../types").Community | null>;
        communities: (_: any, { page, limit }: {
            page?: number;
            limit?: number;
        }, context: Context) => Promise<import("../../types").Community[]>;
        searchCommunities: (_: any, { query, page, limit }: {
            query: string;
            page?: number;
            limit?: number;
        }, context: Context) => Promise<import("../../types").Community[]>;
    };
    Mutation: {
        createCommunity: (_: any, { input }: {
            input: CreateCommunity;
        }, context: Context) => Promise<import("../../types").Community>;
        updateCommunity: (_: any, { id, input }: {
            id: string;
            input: UpdateCommunity;
        }, context: Context) => Promise<import("../../types").Community>;
        deleteCommunity: (_: any, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        addCommunityTopic: (_: any, { id, topic }: {
            id: string;
            topic: string;
        }, context: Context) => Promise<import("../../types").Community>;
        removeCommunityTopic: (_: any, { id, topic }: {
            id: string;
            topic: string;
        }, context: Context) => Promise<import("../../types").Community>;
    };
    Community: {
        topics: (parent: any) => any;
        members: (parent: any) => any;
    };
};
export default communityResolvers;
