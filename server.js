/**
 * Lets Talk Aquariums - Real-time Chat App Backend
 * 
 * This server handles:
 * - General chat rooms (multiple topics)
 * - 1-on-1 advice chat with matching logic
 * - Real-time messaging via Socket.IO
 * - Placeholders for profiles, badges, moderation, etc.
 */

// Load environment variables
require('dotenv').config();

const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const AI_ENABLED = process.env.AI_ENABLED === 'true';

// Configure CORS for local development and Vercel deployments
// This array includes static origins and a RegExp for dynamic Vercel preview URLs
const allowedOrigins = [
  'http://localhost:3001', // Local development
  'https://let-s-talk-aquariums.vercel.app', // Main production URL
  /^https:\/\/.*\.vercel\.app$/, // RegExp to match all Vercel preview URLs (e.g., *.vercel.app)
];

/**
 * CORS origin validation function
 * 
 * This function allows:
 * - Missing origins (server-to-server requests)
 * - Exact string matches from allowedOrigins
 * - RegExp matches from allowedOrigins (for dynamic Vercel preview URLs)
 * 
 * This approach eliminates the need to hardcode individual preview URLs,
 * as any current or future Vercel preview URL will automatically be allowed.
 */
const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (e.g., mobile apps, Postman, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  // Check if origin matches any allowed origin (string or RegExp)
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });

  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = socketIo(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: corsOriginHandler,
  credentials: true
}));
app.use(express.json());

// Serve static files from public directory using absolute path
// This ensures the public folder is found correctly in both local and production environments
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

// General chat rooms available in the app
const GENERAL_ROOMS = [
  'Freshwater',
  'Saltwater',
  'Reef',
  'Community Tank',
  'Photos & Stories'
];

// Experience levels for advice chat
const EXPERIENCE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

// Optional topics for advice chat
const ADVICE_TOPICS = [
  'Fish',
  'Plants',
  'Water chemistry',
  'Equipment'
];

/**
 * Configuration Section Explanation:
 * This section defines constants used throughout the app:
 * - GENERAL_ROOMS: List of available general chat rooms by topic
 * - EXPERIENCE_LEVELS: User experience levels for matching
 * - ADVICE_TOPICS: Optional topics users can select for advice chat
 * - PORT and MONGODB_URI: Server configuration
 */

// ============================================================================
// DATA STRUCTURES (In-memory storage for MVP)
// ============================================================================

// Store active socket connections and user data
const activeUsers = new Map(); // socketId -> userInfo
const userSockets = new Map(); // userId -> socketId

// Store room memberships
const roomMembers = new Map(); // roomName -> Set of socketIds

// Advice chat queue system
const adviceQueue = {
  beginner: [],      // Queue for Beginner users
  intermediate: [],  // Queue for Intermediate users
  advanced: []       // Queue for Advanced users
};

// Active advice chat sessions
const activeAdviceSessions = new Map(); // sessionId -> sessionData

/**
 * Data Structures Explanation:
 * - activeUsers: Maps socket IDs to user information (username, level, etc.)
 * - userSockets: Maps user IDs to socket IDs for quick lookups
 * - roomMembers: Tracks which users are in which general chat rooms
 * - adviceQueue: Separate queues for each experience level waiting for matches
 * - activeAdviceSessions: Stores active 1-on-1 advice chat sessions
 */

// ============================================================================
// MATCHING LOGIC FOR ADVICE CHAT
// ============================================================================

/**
 * Generate a unique session ID for advice chat
 */
function generateSessionId() {
  return `advice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Find a match for a user based on experience level
 * Matching rules:
 * - Beginner → matched with Intermediate (preferred) or Advanced
 * - Intermediate → matched with Intermediate (preferred) or Advanced
 * - Advanced → matched with anyone
 * 
 * @param {string} level - User's experience level
 * @param {string} topic - Optional topic preference
 * @returns {Object|null} - Match data or null if no match found
 */
function findMatch(level, topic = null) {
  let candidates = [];

  if (level === EXPERIENCE_LEVELS.BEGINNER) {
    // Beginner prefers Intermediate, then Advanced
    if (adviceQueue.intermediate.length > 0) {
      candidates = adviceQueue.intermediate;
    } else if (adviceQueue.advanced.length > 0) {
      candidates = adviceQueue.advanced;
    }
  } else if (level === EXPERIENCE_LEVELS.INTERMEDIATE) {
    // Intermediate prefers Intermediate, then Advanced
    if (adviceQueue.intermediate.length > 0) {
      candidates = adviceQueue.intermediate;
    } else if (adviceQueue.advanced.length > 0) {
      candidates = adviceQueue.advanced;
    }
  } else if (level === EXPERIENCE_LEVELS.ADVANCED) {
    // Advanced can match with anyone
    if (adviceQueue.beginner.length > 0) {
      candidates = adviceQueue.beginner;
    } else if (adviceQueue.intermediate.length > 0) {
      candidates = adviceQueue.intermediate;
    } else if (adviceQueue.advanced.length > 0) {
      candidates = adviceQueue.advanced;
    }
  }

  // If topic is specified, prefer users with matching topic
  if (topic && candidates.length > 0) {
    const topicMatch = candidates.find(user => user.topic === topic);
    if (topicMatch) {
      return topicMatch;
    }
  }

  // Return first available candidate or null
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Remove user from advice queue
 * @param {string} socketId - Socket ID of user to remove
 */
function removeFromQueue(socketId) {
  Object.keys(adviceQueue).forEach(level => {
    adviceQueue[level] = adviceQueue[level].filter(user => user.socketId !== socketId);
  });
}

/**
 * Matching Logic Explanation:
 * The findMatch function implements the matching rules:
 * - Beginners are matched with Intermediate or Advanced users (preferring Intermediate)
 * - Intermediate users are matched with Intermediate or Advanced (preferring Intermediate)
 * - Advanced users can be matched with anyone
 * - If a topic is specified, it tries to match users with the same topic preference
 * - The removeFromQueue function cleans up users who disconnect or leave the queue
 */

// ============================================================================
// MONGODB CONNECTION
// ============================================================================

let db;
let client;

async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI is required');
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Create indexes for better performance
    try {
      await db.collection('messages').createIndex({ room: 1, timestamp: -1 });
      await db.collection('advice_messages').createIndex({ sessionId: 1, timestamp: -1 });
      await db.collection('advice_sessions').createIndex({ createdAt: -1 });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
    } catch (indexError) {
      // Indexes may already exist, which is fine
      console.log('📋 MongoDB indexes checked');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// ============================================================================
// SOCKET.IO CONNECTION HANDLING
// ============================================================================

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ========================================================================
  // USER AUTHENTICATION & PROFILE (Placeholder)
  // ========================================================================
  
  socket.on('authenticate', (userData) => {
    // TODO: Implement proper authentication
    // For now, accept user data directly
    
    const userInfo = {
      userId: userData.userId || socket.id,
      username: userData.username || `User_${socket.id.substr(0, 6)}`,
      level: userData.level || EXPERIENCE_LEVELS.BEGINNER,
      tankType: userData.tankType || null,
      tankSize: userData.tankSize || null,
      favoriteFish: userData.favoriteFish || [],
      favoritePlants: userData.favoritePlants || [],
      profilePicture: userData.profilePicture || null,
      socketId: socket.id,
      connectedAt: Date.now()
    };

    activeUsers.set(socket.id, userInfo);
    userSockets.set(userInfo.userId, socket.id);

    socket.emit('authenticated', {
      userId: userInfo.userId,
      username: userInfo.username
    });

    console.log(`User authenticated: ${userInfo.username} (${userInfo.level})`);
  });

  /**
   * Authentication Explanation:
   * This is a placeholder for future authentication. Currently accepts user data
   * directly and stores it in memory. In production, you'd validate tokens,
   * check database, and properly authenticate users.
   */

  // ========================================================================
  // GENERAL CHAT ROOMS
  // ========================================================================

  /**
   * Join a general chat room
   */
  socket.on('join-room', (roomName) => {
    // Validate room name
    if (!GENERAL_ROOMS.includes(roomName)) {
      socket.emit('error', { message: 'Invalid room name' });
      return;
    }

    socket.join(roomName);

    // Track room membership
    if (!roomMembers.has(roomName)) {
      roomMembers.set(roomName, new Set());
    }
    roomMembers.get(roomName).add(socket.id);

    const userInfo = activeUsers.get(socket.id);
    socket.emit('room-joined', { room: roomName });
    
    // Notify others in the room (optional)
    socket.to(roomName).emit('user-joined-room', {
      username: userInfo?.username || 'Anonymous',
      room: roomName
    });

    console.log(`User ${userInfo?.username || socket.id} joined room: ${roomName}`);
  });

  /**
   * Leave a general chat room
   */
  socket.on('leave-room', (roomName) => {
    socket.leave(roomName);
    
    if (roomMembers.has(roomName)) {
      roomMembers.get(roomName).delete(socket.id);
    }

    socket.emit('room-left', { room: roomName });
    console.log(`User ${socket.id} left room: ${roomName}`);
  });

  /**
   * Send message to general chat room
   */
  socket.on('room-message', (data) => {
    const { room, message, photo } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Validate room membership
    if (!socket.rooms.has(room)) {
      socket.emit('error', { message: 'Not a member of this room' });
      return;
    }

    // TODO: Implement profanity filter
    // const filteredMessage = profanityFilter(message);

    // TODO: Implement photo upload/storage
    // if (photo) {
    //   photo = await uploadPhoto(photo);
    // }

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      room: room,
      userId: userInfo.userId,
      username: userInfo.username,
      message: message,
      photo: photo || null,
      timestamp: Date.now(),
      reactions: {} // For emoji reactions: { '👍': [userId1, userId2], '❤️': [userId3] }
    };

    // TODO: Save to MongoDB
    // await saveMessageToDB(messageData);

    // Broadcast to all users in the room
    io.to(room).emit('room-message', messageData);

    console.log(`Message sent to room ${room} by ${userInfo.username}`);
  });

  /**
   * React to a message with emoji
   */
  socket.on('react-to-message', (data) => {
    const { messageId, room, emoji } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo || !socket.rooms.has(room)) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    // TODO: Update reaction in database
    // For now, just broadcast the reaction event
    io.to(room).emit('message-reacted', {
      messageId: messageId,
      room: room,
      userId: userInfo.userId,
      username: userInfo.username,
      emoji: emoji,
      timestamp: Date.now()
    });
  });

  /**
   * General Chat Rooms Explanation:
   * Users can join/leave multiple topic-based rooms and send messages.
   * Messages are broadcast to all members of the room. Photo sharing and
   * emoji reactions are included with placeholders for file upload/storage.
   */

  // ========================================================================
  // ADVICE CHAT (1-on-1 Matching)
  // ========================================================================

  /**
   * Join the advice chat queue
   */
  socket.on('join-advice-queue', (data) => {
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const { level, topic } = data;

    // Validate level
    if (!Object.values(EXPERIENCE_LEVELS).includes(level)) {
      socket.emit('error', { message: 'Invalid experience level' });
      return;
    }

    // Check if already in queue
    removeFromQueue(socket.id);

    // Add to appropriate queue
    const queueEntry = {
      socketId: socket.id,
      userId: userInfo.userId,
      username: userInfo.username,
      level: level,
      topic: topic || null,
      joinedAt: Date.now()
    };

    const queueKey = level.toLowerCase();
    if (adviceQueue[queueKey]) {
      adviceQueue[queueKey].push(queueEntry);
    }

    socket.emit('queued', { level, topic, position: adviceQueue[queueKey].length });

    console.log(`User ${userInfo.username} joined advice queue as ${level}`);

    // Try to find a match immediately
    attemptMatch(socket.id, level, topic);
  });

  /**
   * Leave the advice chat queue
   */
  socket.on('leave-advice-queue', () => {
    removeFromQueue(socket.id);
    socket.emit('queue-left');
    console.log(`User ${socket.id} left advice queue`);
  });

  /**
   * Attempt to match a user with another user
   */
  function attemptMatch(socketId, level, topic) {
    const queueEntry = adviceQueue[level.toLowerCase()].find(u => u.socketId === socketId);
    if (!queueEntry) return;

    const match = findMatch(level, topic);

    if (match && match.socketId !== socketId) {
      // Create a new session
      const sessionId = generateSessionId();
      
      removeFromQueue(socketId);
      removeFromQueue(match.socketId);

      const session = {
        sessionId: sessionId,
        user1: {
          socketId: socketId,
          userId: queueEntry.userId,
          username: queueEntry.username,
          level: queueEntry.level
        },
        user2: {
          socketId: match.socketId,
          userId: match.userId,
          username: match.username,
          level: match.level
        },
        topic: topic || match.topic || null,
        createdAt: Date.now(),
        messages: [],
        ended: false,
        feedback: {}
      };

      activeAdviceSessions.set(sessionId, session);

      // Notify both users
      io.to(socketId).emit('matched', {
        sessionId: sessionId,
        partner: {
          username: match.username,
          level: match.level
        },
        topic: session.topic
      });

      io.to(match.socketId).emit('matched', {
        sessionId: sessionId,
        partner: {
          username: queueEntry.username,
          level: queueEntry.level
        },
        topic: session.topic
      });

      console.log(`Matched ${queueEntry.username} with ${match.username} (Session: ${sessionId})`);
    }
  }

  /**
   * Send message in advice chat
   */
  socket.on('advice-message', (data) => {
    const { sessionId, message, photo } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const session = activeAdviceSessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Check if user is part of this session
    if (session.user1.socketId !== socket.id && session.user2.socketId !== socket.id) {
      socket.emit('error', { message: 'Not authorized for this session' });
      return;
    }

    if (session.ended) {
      socket.emit('error', { message: 'Session has ended' });
      return;
    }

    // TODO: Implement profanity filter
    // const filteredMessage = profanityFilter(message);

    // TODO: Implement photo upload/storage
    // if (photo) {
    //   photo = await uploadPhoto(photo);
    // }

    const messageData = {
      id: `advice_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: sessionId,
      userId: userInfo.userId,
      username: userInfo.username,
      message: message,
      photo: photo || null,
      timestamp: Date.now()
    };

    // Store message in session
    session.messages.push(messageData);

    // TODO: Save to MongoDB
    // await saveAdviceMessageToDB(messageData);

    // Send to partner
    const partnerSocketId = session.user1.socketId === socket.id 
      ? session.user2.socketId 
      : session.user1.socketId;

    io.to(partnerSocketId).emit('advice-message', messageData);
    socket.emit('advice-message-sent', { messageId: messageData.id });

    console.log(`Advice message sent in session ${sessionId}`);
  });

  /**
   * End advice chat session
   */
  socket.on('end-advice-session', (data) => {
    const { sessionId } = data;
    const session = activeAdviceSessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    if (session.user1.socketId !== socket.id && session.user2.socketId !== socket.id) {
      socket.emit('error', { message: 'Not authorized' });
      return;
    }

    session.ended = true;
    session.endedAt = Date.now();
    session.endedBy = socket.id;

    // Notify both users
    const partnerSocketId = session.user1.socketId === socket.id 
      ? session.user2.socketId 
      : session.user1.socketId;

    io.to(partnerSocketId).emit('session-ended', { sessionId });
    socket.emit('session-ended', { sessionId });

    // Request feedback
    io.to(partnerSocketId).emit('request-feedback', { sessionId });
    socket.emit('request-feedback', { sessionId });

    console.log(`Advice session ${sessionId} ended`);
  });

  /**
   * Submit feedback for advice session
   */
  socket.on('submit-feedback', (data) => {
    const { sessionId, rating, comment } = data;
    const session = activeAdviceSessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    const userInfo = activeUsers.get(socket.id);
    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Store feedback
    session.feedback[userInfo.userId] = {
      rating: rating, // 1-5 stars typically
      comment: comment || null,
      timestamp: Date.now()
    };

    // TODO: Save feedback to database
    // TODO: Update user reputation/badges based on feedback
    // await saveFeedbackToDB(sessionId, userInfo.userId, rating, comment);

    socket.emit('feedback-submitted', { sessionId });

    console.log(`Feedback submitted for session ${sessionId} by ${userInfo.username}`);
  });

  /**
   * Advice Chat Explanation:
   * Users join a queue by experience level. The matching algorithm finds
   * appropriate partners based on level preferences. Once matched, users
   * communicate in a private session. Sessions can be ended, and feedback
   * is collected afterward. All messages are stored in memory for now.
   */

  // ========================================================================
  // MODERATION FEATURES (Placeholders)
  // ========================================================================

  /**
   * Block a user
   * TODO: Implement blocking logic, store in database
   */
  socket.on('block-user', (data) => {
    const { userId } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // TODO: Add to blocked users list in database
    // await blockUser(userInfo.userId, userId);

    socket.emit('user-blocked', { userId });
    console.log(`User ${userInfo.username} blocked user ${userId}`);
  });

  /**
   * Report a user
   * TODO: Implement reporting logic, send to moderators
   */
  socket.on('report-user', (data) => {
    const { userId, reason, details } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // TODO: Save report to database, notify moderators
    // await createReport({
    //   reportedBy: userInfo.userId,
    //   reportedUser: userId,
    //   reason: reason,
    //   details: details,
    //   timestamp: Date.now()
    // });

    socket.emit('user-reported', { userId });
    console.log(`User ${userInfo.username} reported user ${userId}`);
  });

  /**
   * Moderation Explanation:
   * Placeholders for blocking and reporting users. In production, these
   * would store data in MongoDB and trigger moderation workflows.
   */

  // ========================================================================
  // USER PROFILES & GAMIFICATION (Placeholders)
  // ========================================================================

  /**
   * Get user profile
   * TODO: Fetch from database
   */
  socket.on('get-profile', (data) => {
    const { userId } = data;
    const userInfo = activeUsers.get(socket.id);

    if (!userInfo) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // TODO: Fetch full profile from database including:
    // - Badges earned
    // - Total messages sent
    // - Feedback ratings received
    // - Level progression
    // - Leaderboard position

    const profile = {
      userId: userId,
      username: userInfo.username,
      level: userInfo.level,
      tankType: userInfo.tankType,
      tankSize: userInfo.tankSize,
      favoriteFish: userInfo.favoriteFish,
      favoritePlants: userInfo.favoritePlants,
      profilePicture: userInfo.profilePicture,
      badges: [], // TODO: Fetch from database
      stats: {
        messagesSent: 0, // TODO: Fetch from database
        sessionsCompleted: 0, // TODO: Fetch from database
        averageRating: 0 // TODO: Fetch from database
      }
    };

    socket.emit('profile', profile);
  });

  /**
   * Get leaderboard
   * TODO: Fetch from database, calculate rankings
   */
  socket.on('get-leaderboard', (data) => {
    const { type } = data; // 'messages', 'sessions', 'rating', etc.

    // TODO: Fetch leaderboard from database
    // const leaderboard = await getLeaderboard(type);

    const leaderboard = []; // Placeholder

    socket.emit('leaderboard', {
      type: type,
      rankings: leaderboard
    });
  });

  /**
   * User Profiles & Gamification Explanation:
   * Placeholders for user profiles, badges, and leaderboards. These would
   * query MongoDB to get user statistics, earned badges, and rankings.
   * Badges could be awarded for milestones like "100 messages sent" or
   * "Helped 10 beginners".
   */

  // ========================================================================
  // DISCONNECTION HANDLING
  // ========================================================================

  socket.on('disconnect', () => {
    const userInfo = activeUsers.get(socket.id);

    // Remove from advice queue
    removeFromQueue(socket.id);

    // Leave all rooms
    roomMembers.forEach((members, roomName) => {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        socket.to(roomName).emit('user-left-room', {
          username: userInfo?.username || 'Anonymous',
          room: roomName
        });
      }
    });

    // Handle active advice sessions
    activeAdviceSessions.forEach((session, sessionId) => {
      if (session.user1.socketId === socket.id || session.user2.socketId === socket.id) {
        // Notify partner
        const partnerSocketId = session.user1.socketId === socket.id 
          ? session.user2.socketId 
          : session.user1.socketId;

        if (!session.ended) {
          session.ended = true;
          session.endedAt = Date.now();
          io.to(partnerSocketId).emit('partner-disconnected', { sessionId });
        }
      }
    });

    // Clean up user data
    if (userInfo) {
      userSockets.delete(userInfo.userId);
      activeUsers.delete(socket.id);
      console.log(`User disconnected: ${userInfo.username}`);
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }
  });

  /**
   * Disconnection Explanation:
   * When a user disconnects, we clean up their data:
   * - Remove from advice queue
   * - Remove from all chat rooms
   * - End active advice sessions and notify partners
   * - Clean up user tracking data
   */
});

// ============================================================================
// RATE LIMITING
// ============================================================================

const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many authentication attempts, please try again later.'
});

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many AI requests, please try again later.'
});

// ============================================================================
// INPUT VALIDATION UTILITIES
// ============================================================================

function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') return null;
  return username.trim().substring(0, 30);
}

function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message cannot exceed 2000 characters' };
  }
  return { valid: true, message: trimmed };
}

function validateRoomName(roomName) {
  return GENERAL_ROOMS.includes(roomName);
}

function validateExperienceLevel(level) {
  return Object.values(EXPERIENCE_LEVELS).includes(level);
}

function validateEnvironment(env) {
  return !env || ['saltwater', 'freshwater'].includes(env);
}

// ============================================================================
// JWT AUTHENTICATION UTILITIES
// ============================================================================

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// JWT middleware for Express routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
}

// ============================================================================
// EXPRESS ROUTES
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Lets Talk Aquariums API',
    version: '1.0.0',
    endpoints: {
      rooms: '/api/rooms',
      stats: '/api/stats',
      auth: '/api/auth/register, /api/auth/login'
    }
  });
});

app.get('/api/rooms', (req, res) => {
  res.json({
    rooms: GENERAL_ROOMS,
    adviceTopics: ADVICE_TOPICS
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    activeUsers: activeUsers.size,
    activeSessions: activeAdviceSessions.size,
    queueSizes: {
      beginner: adviceQueue.beginner.length,
      intermediate: adviceQueue.intermediate.length,
      advanced: adviceQueue.advanced.length
    }
  });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/auth/register', authRateLimit, async (req, res) => {
  try {
    const { email, password, username, level, tankType } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername || sanitizedUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (level && !validateExperienceLevel(level)) {
      return res.status(400).json({ error: 'Invalid experience level' });
    }

    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, { username: sanitizedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userDoc = {
      email: email.toLowerCase(),
      password: hashedPassword,
      username: sanitizedUsername,
      level: level || EXPERIENCE_LEVELS.BEGINNER,
      tankType: tankType || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(userDoc);
    const userId = result.insertedId.toString();

    // Generate token
    const token = generateToken(userId);

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = userDoc;
    res.json({
      user: { ...userWithoutPassword, id: userId, _id: userId },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: { ...userWithoutPassword, id: user._id.toString(), _id: user._id.toString() },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// AI ADVISOR ENDPOINT
// ============================================================================

/**
 * AI Chat endpoint
 * POST /api/ai/chat
 * 
 * Handles AI advisor chat requests
 * Uses OpenAI-compatible API
 */
app.post('/api/ai/chat', aiRateLimit, authenticateToken, async (req, res) => {
  try {
    // Check if AI is enabled
    if (!AI_ENABLED) {
      return res.status(503).json({ 
        error: 'AI Advisor is currently unavailable.',
        enabled: false
      });
    }

    const { message, environment, category } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (environment && !['saltwater', 'freshwater'].includes(environment)) {
      return res.status(400).json({ error: 'Invalid environment. Must be "saltwater" or "freshwater"' });
    }

    // Get OpenAI API key from environment (default to empty for development)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // If no API key, return a helpful message (for development/testing)
    if (!OPENAI_API_KEY) {
      return res.status(200).json({
        message: `[Development Mode] Your message was: "${message}". To enable AI responses, set OPENAI_API_KEY environment variable. This endpoint is configured for ${environment || 'unspecified'} environment and ${category || 'general'} category.`
      });
    }

    // Build system prompt
    const systemPrompt = `You are a professional aquarium advisor.
You give conservative, safe, evidence-based advice.
If critical details are missing (tank size, livestock, age), ask clarifying questions before giving advice.
Tailor responses to ${environment === 'saltwater' ? 'saltwater' : 'freshwater'} environments.
${category && category !== 'general' ? `Focus on ${category} topics.` : ''}

Important rules:
- Avoid definitive medical claims or diagnoses
- Warn when advice depends on tank size or water parameters
- Use a calm, professional tone (no emojis)
- Provide evidence-based recommendations
- When uncertain, recommend consulting with experienced hobbyists`;

    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messageValidation.message }
    ];

    // Call OpenAI-compatible API
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'AI service unavailable. Please try again later.' });
    }

    const aiData = await openaiResponse.json();
    const aiMessage = aiData.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    res.json({
      message: aiMessage
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * AI Advisor Explanation:
 * This endpoint handles AI chat requests. It:
 * - Validates input (message, environment, category)
 * - Uses OpenAI-compatible API (configurable via environment variables)
 * - Applies system prompt with safety rules
 * - Returns AI response
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: API key for OpenAI (or compatible service)
 * - OPENAI_API_URL: API endpoint (defaults to OpenAI, but can be set to compatible services)
 * - OPENAI_MODEL: Model to use (defaults to gpt-4o-mini)
 * 
 * If OPENAI_API_KEY is not set, returns a development message instead of calling the API.
 */

/**
 * Express Routes Explanation:
 * Basic REST endpoints for getting available rooms and app statistics.
 * These can be expanded to include user profiles, message history,
 * and other data retrieval endpoints.
 */


// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler (must be after all routes, before error handler)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Backend error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Start server
async function startServer() {
  try {
    // Connect to MongoDB first
    if (MONGODB_URI) {
      await connectMongoDB();
    } else {
      console.warn('⚠️  MONGODB_URI not set - MongoDB features will not work');
    }
    
    // Then start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO server ready for connections`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`💬 Available rooms: ${GENERAL_ROOMS.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    console.log('Server closed');
    process.exit(0);
  });
});

/**
 * Server Startup Explanation:
 * The server starts listening on the specified PORT. Socket.IO is ready
 * to handle real-time connections, and Express handles REST API requests.
 * MongoDB connection is commented out for the MVP but can be enabled
 * when persistence is needed.
 */
