/**
 * GeneralRoomPage Component
 * 
 * Community chat room with editorial design:
 * - Split layout with sidebar and main chat area
 * - Subtle environmental visuals
 * - Refined message containers
 * - Professional, immersive experience
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSocket } from '../utils/socket';
import { chatAPI, mediaAPI, moderationAPI } from '../services/api';
import { showMessageNotification, requestNotificationPermission } from '../utils/notifications';
import { useUser } from '../contexts/UserContext';

const COMMUNITY_ROOMS = [
  { id: 'Freshwater', name: 'Freshwater', description: 'Freshwater tanks, fish, and aquascaping', color: 'blue' },
  { id: 'Saltwater', name: 'Saltwater', description: 'Saltwater aquarium topics and marine life', color: 'teal' },
  { id: 'Reef', name: 'Reef Systems', description: 'Advanced reef keeping and coral care', color: 'purple' },
  { id: 'Community Tank', name: 'Community Tank', description: 'General community tank discussions', color: 'green' },
  { id: 'Photos & Stories', name: 'Photos & Stories', description: 'Share your tank photos and experiences', color: 'orange' },
];

const GeneralRoomPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user: currentUser } = useUser();

  // Get user data and room from navigation state
  const { userData, room } = location.state || {};

  // Component state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(new Set());

  const currentRoom = COMMUNITY_ROOMS.find(r => r.name === room) || { name: room, description: '', color: 'gray' };

  /**
   * Scroll to bottom of messages when new messages arrive
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Load blocked users list
  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        const blocked = await moderationAPI.getBlockedUsers();
        setBlockedUsers(new Set(blocked));
      } catch (error) {
        console.error('Error loading blocked users:', error);
      }
    };
    loadBlockedUsers();
  }, []);

  /**
   * Initialize Socket.IO connection and set up event handlers
   */
  useEffect(() => {
    // Redirect to general chat if no user data
    if (!userData || !room) {
      navigate('/general-chat');
      return;
    }

    // Create socket connection
    const newSocket = createSocket();
    newSocket.connect();
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Authenticate user
    newSocket.emit('authenticate', {
      username: userData.username,
      level: userData.level,
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Handle authentication success
    newSocket.on('authenticated', (data) => {
      console.log('Authenticated:', data);
      setConnected(true);
      setUserId(data.userId);

      // Join the selected room
      newSocket.emit('join-room', room);
    });

    // Handle room joined confirmation
    newSocket.on('room-joined', async (data) => {
      console.log('Joined room:', data.room);
      setError(null);
      
      // Load chat history from backend
      try {
        setLoadingHistory(true);
        const history = await chatAPI.getRoomHistory(room, 50);
        if (history.messages && history.messages.length > 0) {
          setMessages(history.messages.reverse());
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    });

    // Handle incoming messages
    newSocket.on('room-message', (messageData) => {
      console.log('Message received:', messageData);
      // Filter out blocked users
      if (!blockedUsers.has(messageData.userId) && !blockedUsers.has(messageData.username)) {
        setMessages(prev => [...prev, messageData]);
        // Show notification if not from current user
        if (messageData.userId !== userId) {
          showMessageNotification(messageData.username, messageData.text);
        }
      }
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection error. Please refresh the page.');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userData, room, navigate, blockedUsers, userId]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !connected) return;

    const messageData = {
      text: messageInput.trim(),
      room: room,
      userId: userId,
      username: userData.username,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, messageData]);
    setMessageInput('');

    // Send to server
    socket.emit('room-message', messageData);

    // Also save to backend
    try {
      await chatAPI.saveRoomMessage(room, messageData);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const result = await mediaAPI.uploadMedia(file);
      if (result.success) {
        // Add media URL to message input or send as media message
        setMessageInput(prev => prev + (prev ? ' ' : '') + result.url);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Format timestamp to readable time
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user for styling
  const isOwnMessage = (messageUserId) => messageUserId === userId;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Room Header */}
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={() => navigate('/general-chat')}
            className="text-sm text-gray-400 hover:text-gray-200 mb-4 flex items-center group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Rooms
          </button>
          <h2 className="text-xl font-semibold text-white mb-1">{currentRoom.name}</h2>
          <p className="text-sm text-gray-400">{currentRoom.description}</p>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Other Rooms</div>
          <div className="space-y-1">
            {COMMUNITY_ROOMS.filter(r => r.name !== room).map((roomItem) => (
              <button
                key={roomItem.id}
                onClick={() => {
                  navigate('/general-room', {
                    state: {
                      userData,
                      room: roomItem.name
                    }
                  });
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {roomItem.name}
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-300">
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userData?.username || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{userData?.level || 'Beginner'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Environmental Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-teal-900 to-slate-900"></div>
        </div>

        <div className="flex-1 flex flex-col relative z-10">
          {/* Chat Header */}
          <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">{currentRoom.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{currentRoom.description}</p>
              </div>
              {connected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-400">Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {loadingHistory && (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                </div>
              )}

              {messages.map((message, index) => {
                const own = isOwnMessage(message.userId);
                return (
                  <div
                    key={index}
                    className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${own ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      {!own && (
                        <span className="text-xs text-gray-500 mb-1 px-1">{message.username}</span>
                      )}
                      <div
                        className={`
                          px-4 py-2.5 rounded-lg
                          ${own
                            ? 'bg-accent-600 text-white'
                            : 'bg-gray-800/60 backdrop-blur-sm text-gray-100 border border-gray-700'
                          }
                        `}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                      </div>
                      <span className={`text-xs text-gray-500 mt-1 px-1 ${own ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input Area */}
          <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    disabled={!connected}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!connected || uploadingMedia}
                  className="p-3 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="submit"
                  disabled={!connected || !messageInput.trim()}
                  className="px-6 py-3 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-20 left-6 right-6 max-w-4xl mx-auto bg-red-900/90 backdrop-blur-sm border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralRoomPage;
