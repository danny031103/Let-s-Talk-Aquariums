/**
 * API Service Layer
 * 
 * Handles all HTTP requests to the backend API
 * - Authentication (login, register, logout)
 * - User profile management
 * - Chat history and messages
 * - Media uploads
 * - Gamification data
 * - Moderation actions
 * 
 * All endpoints are prepared for backend integration
 * Uses JWT tokens stored in localStorage for authentication
 */

// API Base URL - configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:3000/api';

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Set authentication token in localStorage
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Preserve error details for proper error handling
      const error = new Error(data.error || data.message || 'API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Object} - { user, token }
   */
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - { user, token }
   */
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
    }
  },

  /**
   * Get current user
   * @returns {Object} - User object
   */
  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },

  /**
   * Refresh authentication token
   * @returns {Object} - { token }
   */
  refreshToken: async () => {
    const response = await apiRequest('/auth/refresh', { method: 'POST' });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },
};

/**
 * User Profile API
 */
export const profileAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Object} - User profile
   */
  getProfile: async (userId = null) => {
    const endpoint = userId ? `/users/${userId}` : '/users/profile';
    return await apiRequest(endpoint);
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Object} - Updated user profile
   */
  updateProfile: async (updates) => {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Upload profile picture
   * @param {File} file - Image file
   * @returns {Object} - { url: string }
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/users/profile/picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  },
};

/**
 * Chat API
 */
export const chatAPI = {
  /**
   * Get chat history for a room
   * @param {string} roomName - Room name
   * @param {number} limit - Number of messages to fetch
   * @param {string} before - Message ID to fetch messages before
   * @returns {Object} - { messages: Array, hasMore: boolean }
   */
  getRoomHistory: async (roomName, limit = 50, before = null) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    return await apiRequest(`/chat/rooms/${roomName}/messages?${params}`);
  },

  /**
   * Get advice chat session history
   * @param {string} sessionId - Session ID
   * @returns {Object} - { messages: Array }
   */
  getAdviceChatHistory: async (sessionId) => {
    return await apiRequest(`/chat/advice/${sessionId}/messages`);
  },

  /**
   * Get user's advice chat sessions
   * @returns {Array} - List of sessions
   */
  getAdviceSessions: async () => {
    return await apiRequest('/chat/advice/sessions');
  },
};

/**
 * Media API
 */
export const mediaAPI = {
  /**
   * Upload image for chat
   * @param {File} file - Image file
   * @returns {Object} - { url: string, id: string }
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  },
};

/**
 * Gamification API
 */
export const gamificationAPI = {
  /**
   * Get user badges and achievements
   * @param {string} userId - User ID (optional)
   * @returns {Object} - { badges: Array, points: number, level: number }
   */
  getUserStats: async (userId = null) => {
    const endpoint = userId ? `/gamification/users/${userId}/stats` : '/gamification/stats';
    return await apiRequest(endpoint);
  },

  /**
   * Get leaderboard
   * @param {string} type - Leaderboard type (messages, sessions, rating, points)
   * @param {number} limit - Number of entries
   * @returns {Array} - Leaderboard entries
   */
  getLeaderboard: async (type = 'points', limit = 100) => {
    const params = new URLSearchParams({ type, limit: limit.toString() });
    return await apiRequest(`/gamification/leaderboard?${params}`);
  },
};

/**
 * Moderation API
 */
export const moderationAPI = {
  /**
   * Block a user
   * @param {string} userId - User ID to block
   * @returns {Object} - Success response
   */
  blockUser: async (userId) => {
    return await apiRequest('/moderation/block', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Unblock a user
   * @param {string} userId - User ID to unblock
   * @returns {Object} - Success response
   */
  unblockUser: async (userId) => {
    return await apiRequest('/moderation/unblock', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Report a user
   * @param {Object} reportData - { userId, reason, details }
   * @returns {Object} - Success response
   */
  reportUser: async (reportData) => {
    return await apiRequest('/moderation/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  /**
   * Get blocked users list
   * @returns {Array} - List of blocked user IDs
   */
  getBlockedUsers: async () => {
    return await apiRequest('/moderation/blocked');
  },
};

/**
 * AI API
 */
export const aiAPI = {
  /**
   * Send a message to the AI advisor
   * @param {Object} data - { message, environment, category }
   * @returns {Object} - { message: string }
   */
  chat: async (data) => {
    return await apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * API Service Explanation:
 * 
 * This service layer provides a clean interface for all backend API calls.
 * It handles:
 * - JWT token management (stored in localStorage)
 * - Automatic token attachment to requests
 * - Error handling and response parsing
 * - File uploads for media and profile pictures
 * 
 * All endpoints follow RESTful conventions and are ready for backend integration.
 * The API_BASE_URL can be configured via environment variable.
 * 
 * For MVP/testing, these can return mock data or work with localStorage fallback.
 */
