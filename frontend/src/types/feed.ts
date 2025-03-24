import { Theme } from '@mui/material';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  _id?: string;
  _rev?: string;
  type: 'post';
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
  files?: File[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface CreatePostData {
  type: 'post';
  author: string;
  avatar: string;
  title: string;
  content: string;
  tags: string[];
  files?: File[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: CreatePostData) => Promise<void>;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface PostCardProps {
  post: Post;
  currentUser: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => void;
}

export interface StyleProps {
  theme: Theme;
}