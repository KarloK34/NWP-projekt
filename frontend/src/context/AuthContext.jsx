import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        // Verify token is still valid by fetching current user
        getCurrentUser();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        clearAuth();
      }
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });

      const { user: userData, token } = response.data.data;

      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Greška pri registraciji';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { user: userData, token } = response.data.data;

      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Greška pri prijavi';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    clearAuth();
  };

  /**
   * Get current user from API
   */
  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      // Token might be invalid, clear auth
      clearAuth();
      return { success: false, error: error.response?.data?.message };
    }
  };

  /**
   * Clear authentication data
   */
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    getCurrentUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

