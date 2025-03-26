import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Post, PostInput, PostUpdate } from '../types/feed';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create Apollo Client instance
const client = new ApolloClient({
  uri: `${API_URL}/graphql`,
  cache: new InMemoryCache(),
  credentials: 'include'
});

// GraphQL Queries and Mutations
const QUERIES = {
  GET_POSTS: gql`
    query GetPosts($page: Int, $limit: Int) {
      posts(page: $page, limit: $limit) {
        id
        title
        content
        author {
          id
          username
          avatar
        }
        tags
        likes
        comments
        createdAt
        updatedAt
      }
    }
  `,

  CREATE_POST: gql`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        title
        content
        author {
          id
          username
          avatar
        }
        tags
        likes
        comments
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_POST: gql`
    mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
      updatePost(id: $id, input: $input) {
        id
        title
        content
        author {
          id
          username
          avatar
        }
        tags
        likes
        comments
        createdAt
        updatedAt
      }
    }
  `,

  DELETE_POST: gql`
    mutation DeletePost($id: ID!) {
      deletePost(id: $id)
    }
  `,

  LIKE_POST: gql`
    mutation LikePost($id: ID!) {
      likePost(id: $id) {
        id
        likes
      }
    }
  `,

  UNLIKE_POST: gql`
    mutation UnlikePost($id: ID!) {
      unlikePost(id: $id) {
        id
        likes
      }
    }
  `
};

// Feed service implementation
export const feedService = {
  // Get posts with pagination
  async getPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const { data } = await client.query({
        query: QUERIES.GET_POSTS,
        variables: { page, limit },
        fetchPolicy: 'network-only'
      });
      return data.posts.map((post: any) => ({
        ...post,
        timestamp: post.createdAt,
        likedBy: [], // Backend doesn't support this yet
        comments: [], // Backend returns comment count, not actual comments
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  },

  // Create a new post
  async createPost(post: PostInput): Promise<Post> {
    try {
      const { data } = await client.mutate({
        mutation: QUERIES.CREATE_POST,
        variables: {
          input: {
            title: post.title,
            content: post.content,
            tags: post.tags
          }
        }
      });
      return {
        ...data.createPost,
        timestamp: data.createPost.createdAt,
        likedBy: [],
        comments: []
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  },

  // Update a post
  async updatePost(id: string, update: PostUpdate): Promise<Post> {
    try {
      const { data } = await client.mutate({
        mutation: QUERIES.UPDATE_POST,
        variables: {
          id,
          input: {
            title: update.title,
            content: update.content,
            tags: update.tags
          }
        }
      });
      return {
        ...data.updatePost,
        timestamp: data.updatePost.createdAt,
        likedBy: [],
        comments: []
      };
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  },

  // Delete a post
  async deletePost(id: string): Promise<boolean> {
    try {
      const { data } = await client.mutate({
        mutation: QUERIES.DELETE_POST,
        variables: { id }
      });
      return data.deletePost;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  },

  // Like a post
  async likePost(id: string): Promise<Post> {
    try {
      const { data } = await client.mutate({
        mutation: QUERIES.LIKE_POST,
        variables: { id }
      });
      return {
        ...data.likePost,
        timestamp: data.likePost.createdAt,
        likedBy: [],
        comments: []
      };
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Failed to like post');
    }
  },

  // Unlike a post
  async unlikePost(id: string): Promise<Post> {
    try {
      const { data } = await client.mutate({
        mutation: QUERIES.UNLIKE_POST,
        variables: { id }
      });
      return {
        ...data.unlikePost,
        timestamp: data.unlikePost.createdAt,
        likedBy: [],
        comments: []
      };
    } catch (error) {
      console.error('Error unliking post:', error);
      throw new Error('Failed to unlike post');
    }
  }
};

export default feedService;