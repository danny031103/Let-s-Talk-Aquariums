/**
 * Socket.IO Connection Utility
 * 
 * This module exports a function to create and manage Socket.IO connections.
 * It handles connection, authentication, and provides a reusable socket instance.
 */

import { io } from 'socket.io-client';

// Server URL - configured via environment variable
const SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Create and configure a Socket.IO connection
 * @returns {Object} Socket.IO client instance
 */
export const createSocket = () => {
  const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: false
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

/**
 * Socket Utility Explanation:
 * This module provides a centralized way to create Socket.IO connections.
 * The socket is configured with autoConnect: false so we can control when
 * to connect (after user enters their info). The SERVER_URL can be changed
 * via environment variable for different deployment environments.
 */
