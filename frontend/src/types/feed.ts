export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  likedBy: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likes: number;
  timestamp: string;
}

export interface PostInput {
  content: string;
  tags?: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
  };
}

export interface PostUpdate {
  content?: string;
  tags?: string[];
  likes?: number;
  comments?: Comment[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
  };
}

export interface FeedFilters {
  type?: 'all' | 'classroom' | 'community';
  tag?: string;
  author?: string;
  timeRange?: 'today' | 'week' | 'month' | 'all';
}

export interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  filters: FeedFilters;
  page: number;
  hasMore: boolean;
}