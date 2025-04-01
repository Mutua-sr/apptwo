import axios from 'axios';
import { ApiResponse } from '../types/api';

interface UserDetails {
  id: string;
  username: string;
  avatar?: string;
  name?: string;
  email?: string;
}

// In-memory cache for user details
const userCache = new Map<string, {
  details: UserDetails;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const userService = {
  // Batch fetch user details
  async fetchUserDetails(userIds: string[]): Promise<Map<string, UserDetails>> {
    const now = Date.now();
    const uncachedIds = userIds.filter(id => {
      const cached = userCache.get(id);
      return !cached || (now - cached.timestamp > CACHE_DURATION);
    });

    if (uncachedIds.length > 0) {
      try {
        const response = await axios.post<ApiResponse<UserDetails[]>>(
          `${API_BASE_URL}/users/batch`,
          { userIds: uncachedIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        // Update cache with new data
        response.data.data.forEach(user => {
          userCache.set(user.id, {
            details: user,
            timestamp: now
          });
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }

    // Return all requested users (from cache)
    const result = new Map<string, UserDetails>();
    userIds.forEach(id => {
      const cached = userCache.get(id);
      if (cached) {
        result.set(id, cached.details);
      }
    });

    return result;
  },

  // Get a single user's details (uses cache)
  async getUserDetails(userId: string): Promise<UserDetails | null> {
    const users = await this.fetchUserDetails([userId]);
    return users.get(userId) || null;
  },

  // Clear cache for testing or when needed
  clearCache() {
    userCache.clear();
  },

  // Update cache with new user data (useful after profile updates)
  updateCache(user: UserDetails) {
    userCache.set(user.id, {
      details: user,
      timestamp: Date.now()
    });
  }
};

export default userService;