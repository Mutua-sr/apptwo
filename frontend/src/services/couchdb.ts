import axios from 'axios';

const COUCHDB_URL = 'http://localhost:5984';
const DB_NAME = 'eduapp';

// CouchDB authentication credentials
const AUTH = {
  username: 'Meshack',
  password: '3.FocusMode'
};

// Create axios instance with authentication
const couchdbClient = axios.create({
  baseURL: COUCHDB_URL,
  auth: AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize database if it doesn't exist
export const initializeDatabase = async () => {
  try {
    await couchdbClient.put(`/${DB_NAME}`);
  } catch (error: any) {
    // Database already exists (error code 412) is okay
    if (error.response?.status !== 412) {
      console.error('Error initializing database:', error);
    }
  }
};

// Feed-related functions
export const feedService = {
  // Get posts with pagination
  getPosts: async (page: number, limit: number = 10) => {
    try {
      const skip = (page - 1) * limit;
      const response = await couchdbClient.post(`/${DB_NAME}/_find`, {
        selector: {
          type: 'post',
        },
        sort: [{ timestamp: 'desc' }],
        skip,
        limit,
      });
      return response.data.docs;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Create a new post
  createPost: async (post: any) => {
    try {
      const document = {
        ...post,
        type: 'post',
        timestamp: new Date().toISOString(),
      };
      const response = await couchdbClient.post(`/${DB_NAME}`, document);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (query: string) => {
    try {
      const response = await couchdbClient.post(`/${DB_NAME}/_find`, {
        selector: {
          type: 'post',
          $or: [
            { title: { $regex: `(?i)${query}` } },
            { content: { $regex: `(?i)${query}` } },
            { tags: { $elemMatch: { $regex: `(?i)${query}` } } },
          ],
        },
      });
      return response.data.docs;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },
};

// Initialize database when the service is imported
initializeDatabase();

export default feedService;