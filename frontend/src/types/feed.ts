export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  likedBy: string[];  // Frontend-only field
  sharedTo?: {        // Frontend-only field
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface PostInput {
  title: string;
  content: string;
  tags: string[];
}

export interface PostUpdate {
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
}

export interface QueryOptions {
  page?: number;
  limit?: number;
}

export interface ShareTarget {
  id: string;
  name: string;
  type: 'classroom' | 'community';
}