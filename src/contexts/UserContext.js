/**
 * UserContext
 * 
 * Provides user authentication and profile state management
 * - Integrates with backend API using JWT authentication
 * - Falls back to localStorage for development/MVP
 * - Handles session persistence and token management
 * 
 * Features:
 * - User registration with backend API
 * - User login/logout with JWT tokens
 * - User profile management
 * - Persistent session (JWT token + user data)
 * - Auto-refresh tokens when needed
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const UserContext = createContext();

// Flag to enable/disable backend API (set to false for localStorage-only mode)
// Set to false to use localStorage fallback, true to use backend API
const USE_BACKEND_API = true; // Change to false for localStorage-only mode

/**
 * UserProvider component
 * Wraps the app and provides user state and functions
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize user on mount
   * - Try to load from backend using token
   * - Fall back to localStorage if backend unavailable
   */
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (USE_BACKEND_API) {
          // Try to get user from backend using stored token
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData.user || userData);
          } catch (error) {
            // Backend unavailable or invalid token, try localStorage fallback
            const savedUser = localStorage.getItem('aquarium_chat_user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        } else {
          // localStorage-only mode
          const savedUser = localStorage.getItem('aquarium_chat_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('User initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - { success: boolean, message: string }
   */
  const register = async (userData) => {
    try {
      if (USE_BACKEND_API) {
        // Backend registration
        try {
          const response = await authAPI.register(userData);
          const user = response.user || response;
          setUser(user);
          localStorage.setItem('aquarium_chat_user', JSON.stringify(user));
          return { success: true, message: 'Registration successful' };
        } catch (error) {
          return { success: false, message: error.message || 'Registration failed' };
        }
      } else {
        // localStorage fallback
        const existingUsers = JSON.parse(localStorage.getItem('aquarium_chat_users') || '[]');
        const emailExists = existingUsers.some(u => u.email === userData.email);

        if (emailExists) {
          return { success: false, message: 'Email already registered' };
        }

        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          level: userData.level || 'Beginner',
          tankType: userData.tankType || null,
          tankSize: userData.tankSize || null,
          favoriteFish: userData.favoriteFish || [],
          favoritePlants: userData.favoritePlants || [],
          favoriteCoral: userData.favoriteCoral || [],
          badges: [],
          profilePicture: null,
          points: 0,
          createdAt: Date.now()
        };

        existingUsers.push(newUser);
        localStorage.setItem('aquarium_chat_users', JSON.stringify(existingUsers));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('aquarium_chat_user', JSON.stringify(userWithoutPassword));

        return { success: true, message: 'Registration successful' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - { success: boolean, message: string }
   */
  const login = async (email, password) => {
    try {
      if (USE_BACKEND_API) {
        // Backend login
        try {
          const response = await authAPI.login(email, password);
          const user = response.user || response;
          setUser(user);
          localStorage.setItem('aquarium_chat_user', JSON.stringify(user));
          return { success: true, message: 'Login successful' };
        } catch (error) {
          return { success: false, message: error.message || 'Invalid email or password' };
        }
      } else {
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('aquarium_chat_users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (!foundUser) {
          return { success: false, message: 'Invalid email or password' };
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('aquarium_chat_user', JSON.stringify(userWithoutPassword));

        return { success: true, message: 'Login successful' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      if (USE_BACKEND_API) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('aquarium_chat_user');
    }
  };

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Object} - { success: boolean, message: string }
   */
  const updateProfile = async (updates) => {
    try {
      if (USE_BACKEND_API) {
        // Backend update
        try {
          const updatedUser = await profileAPI.updateProfile(updates);
          setUser(updatedUser);
          localStorage.setItem('aquarium_chat_user', JSON.stringify(updatedUser));
          return { success: true, message: 'Profile updated successfully' };
        } catch (error) {
          return { success: false, message: error.message || 'Profile update failed' };
        }
      } else {
        // localStorage fallback
        const updatedUser = { ...user, ...updates };
        
        const users = JSON.parse(localStorage.getItem('aquarium_chat_users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('aquarium_chat_users', JSON.stringify(users));
        }

        setUser(updatedUser);
        localStorage.setItem('aquarium_chat_user', JSON.stringify(updatedUser));

        return { success: true, message: 'Profile updated successfully' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: error.message || 'Profile update failed' };
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    if (!USE_BACKEND_API || !user) return;

    try {
      const userData = await profileAPI.getProfile();
      setUser(userData.user || userData);
      localStorage.setItem('aquarium_chat_user', JSON.stringify(userData.user || userData));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to use UserContext
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

/**
 * UserContext Explanation:
 * 
 * This context manages user authentication with backend API integration:
 * - USE_BACKEND_API flag controls whether to use backend or localStorage
 * - Falls back to localStorage if backend is unavailable (for development)
 * - JWT tokens are managed automatically by the API service
 * - User data is cached in localStorage for quick access
 * - refreshUser() can be called to sync with backend data
 * 
 * The context provides:
 * - user: Current user object (or null)
 * - isAuthenticated: Boolean indicating authentication status
 * - loading: Boolean indicating if user data is being loaded
 * - register(): Register new user
 * - login(): Authenticate user
 * - logout(): Clear session
 * - updateProfile(): Update user profile
 * - refreshUser(): Sync user data from backend
 */
