import { CouchDBDocument } from './index';
export interface Post extends CouchDBDocument {
    type: 'post';
    title: string;
    content: string;
    author: {
        id: string;
        username: string;
        avatar?: string;
    };
    tags: string[];
    likes: number;
    comments: Comment[];
    likedBy: string[];
    sharedTo?: {
        type: 'classroom' | 'community';
        id: string;
        name: string;
    };
    imageUrl?: string;
    status: 'draft' | 'published';
    visibility: 'public' | 'private' | 'shared';
    createdAt: string;
    updatedAt: string;
}
export interface Comment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    timestamp: string;
    likes: number;
}
export interface CreatePost {
    type: 'post';
    title: string;
    content: string;
    author: {
        id: string;
        username: string;
        avatar?: string;
    };
    tags: string[];
    imageUrl?: string;
    status?: 'draft' | 'published';
    visibility?: 'public' | 'private' | 'shared';
}
export interface UpdatePost {
    title?: string;
    content?: string;
    tags?: string[];
    likes?: number;
    likedBy?: string[];
    comments?: Comment[];
    sharedTo?: {
        type: 'classroom' | 'community';
        id: string;
        name: string;
    };
    imageUrl?: string;
    status?: 'draft' | 'published';
    visibility?: 'public' | 'private' | 'shared';
}
export interface CreateComment {
    author: string;
    avatar?: string;
    content: string;
}
export interface ShareTarget {
    id: string;
    name: string;
    type: 'classroom' | 'community';
}
