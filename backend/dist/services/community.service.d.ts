import { Community, CreateCommunity, UpdateCommunity } from '../types';
export declare class CommunityService {
    private static readonly TYPE;
    static create(input: CreateCommunity): Promise<Community>;
    static getById(id: string): Promise<Community | null>;
    static list(page?: number, limit?: number): Promise<Community[]>;
    static update(id: string, data: UpdateCommunity): Promise<Community>;
    static delete(id: string): Promise<boolean>;
    static getByTopic(topic: string): Promise<Community[]>;
    static updateMemberCount(id: string, count: number): Promise<Community>;
    static searchByName(query: string, page?: number, limit?: number): Promise<Community[]>;
    static addTopic(id: string, topic: string): Promise<Community>;
    static removeTopic(id: string, topic: string): Promise<Community>;
}
export default CommunityService;
