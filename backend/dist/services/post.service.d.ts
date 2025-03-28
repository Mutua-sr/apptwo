import { Post, CreatePost, UpdatePost, QueryOptions } from '../types';
export declare class PostService {
    private static readonly TYPE;
    static create(input: CreatePost): Promise<Post>;
    static getById(id: string): Promise<Post | null>;
    static list(options?: QueryOptions): Promise<Post[]>;
    static update(id: string, data: UpdatePost): Promise<Post>;
    static delete(id: string): Promise<boolean>;
    static getByTag(tag: string, options?: QueryOptions): Promise<Post[]>;
    static getByAuthor(authorId: string, options?: QueryOptions): Promise<Post[]>;
    static like(id: string): Promise<Post>;
    static unlike(id: string): Promise<Post>;
    static search(query: string, options?: QueryOptions): Promise<Post[]>;
}
export default PostService;
