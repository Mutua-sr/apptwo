import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService, { ApiError } from '../services/apiService';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  error: null,
  isLoading: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = apiService.auth.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Clear potentially corrupted auth state
        apiService.auth.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.auth.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? apiService.handleError(err)
        : 'An unexpected error occurred during login';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      apiService.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      error,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
