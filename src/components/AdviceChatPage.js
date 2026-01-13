/**
 * AdviceChatPage Component
 * 
 * Private advice chat with editorial design:
 * - Elevated 1-on-1 session experience
 * - Split layout with context sidebar
 * - Refined message containers
 * - Professional, focused atmosphere
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSocket } from '../utils/socket';

const AdviceChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get user data and optional topic from navigation state
  const { userData, topic } = location.state || {};

  // Component state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [queued, setQueued] = useState(false);
  const [matched, setMatched] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [error, setError] = useState(null);

  /**
   * Scroll to bottom of messages when new messages arrive
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Initialize Socket.IO connection and join queue
   */
  useEffect(() => {
    // Redirect to topic chats if no user data
    if (!userData) {
      navigate('/topic-chats');
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

      // Automatically join advice queue
      newSocket.emit('join-advice-queue', {
        level: userData.level,
        topic: topic || null
      });
    });

    // Handle queued confirmation
    newSocket.on('queued', (data) => {
      console.log('Queued:', data);
      setQueued(true);
      setError(null);
    });

    // Handle match found
    newSocket.on('matched', (data) => {
      console.log('Matched!', data);
      setMatched(true);
      setQueued(false);
      setSessionId(data.sessionId);
      setPartner(data.partner);
      setError(null);
    });

    // Handle incoming messages
    newSocket.on('advice-message', (messageData) => {
      console.log('Message received:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    // Handle message sent confirmation
    newSocket.on('advice-message-sent', (data) => {
      console.log('Message sent:', data);
    });

    // Handle session ended
    newSocket.on('session-ended', (data) => {
      console.log('Session ended:', data);
      setSessionEnded(true);
      setMatched(false);
    });

    // Handle partner disconnection
    newSocket.on('partner-disconnected', (data) => {
      console.log('Partner disconnected:', data);
      setError('Your partner has disconnected.');
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
  }, [userData, topic, navigate]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !connected || !matched) return;

    const messageData = {
      text: messageInput.trim(),
      sessionId: sessionId,
      userId: userId,
      username: userData.username,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, messageData]);
    setMessageInput('');

    // Send to server
    socket.emit('advice-message', {
      sessionId: sessionId,
      message: messageInput.trim()
    });
  };

  /**
   * Handle ending session
   */
  const handleEndSession = () => {
    if (socket && sessionId) {
      socket.emit('end-advice-session', { sessionId });
      setSessionEnded(true);
      setMatched(false);
      setShowFeedback(true);
    }
  };

  /**
   * Handle feedback submission
   */
  const handleSubmitFeedback = async () => {
    // In production, this would send feedback to backend
    console.log('Feedback submitted:', { rating: feedbackRating, comment: feedbackComment, sessionId });
    
    // Show confirmation and redirect
    navigate('/topic-chats');
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
        {/* Session Header */}
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={() => navigate('/topic-chats')}
            className="text-sm text-gray-400 hover:text-gray-200 mb-4 flex items-center group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h2 className="text-xl font-semibold text-white mb-1">Private Advice</h2>
          <p className="text-sm text-gray-400">1-on-1 session</p>
        </div>

        {/* Session Info */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {matched && partner && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Session Details</div>
                {topic && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Topic</div>
                    <div className="text-sm font-medium text-white">{topic}</div>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">You</div>
                    <div className="text-sm font-medium text-white">{userData?.username}</div>
                    <div className="text-xs text-gray-500">{userData?.level}</div>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Partner</div>
                    <div className="text-sm font-medium text-white">{partner.username || 'Matched User'}</div>
                    <div className="text-xs text-gray-500">{partner.level || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {queued && !matched && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-gray-600 border-t-accent-500 rounded-full animate-spin mb-4"></div>
              <div className="text-sm text-gray-400">Finding a match...</div>
              {topic && (
                <div className="text-xs text-gray-500 mt-2">Topic: {topic}</div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {matched && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleEndSession}
              className="w-full px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Environmental Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900"></div>
        </div>

        <div className="flex-1 flex flex-col relative z-10">
          {/* Chat Header */}
          <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">Private Advice Session</h1>
                {topic && (
                  <p className="text-sm text-gray-400 mt-0.5">Topic: {topic}</p>
                )}
              </div>
              {connected && matched && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-400">Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto">
              {!matched && queued && (
                <div className="text-center py-16">
                  <div className="inline-block w-12 h-12 border-2 border-gray-600 border-t-accent-500 rounded-full animate-spin mb-4"></div>
                  <h3 className="text-lg font-medium text-white mb-2">Finding a match</h3>
                  <p className="text-sm text-gray-400">
                    We're matching you with an experienced hobbyist{topic ? ` for ${topic}` : ''}.
                  </p>
                </div>
              )}

              {matched && messages.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-white mb-2">Session started</h3>
                  <p className="text-sm text-gray-400">
                    You've been matched. Start the conversation below.
                  </p>
                </div>
              )}

              <div className="space-y-4">
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
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text || message.message || ''}</p>
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
          </div>

          {/* Message Input Area */}
          {matched && !sessionEnded && (
            <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      disabled={!connected}
                    />
                  </div>
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
          )}

          {/* Feedback Form */}
          {showFeedback && (
            <div className="bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 px-6 py-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Session Feedback</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackRating(rating)}
                          className={`w-10 h-10 rounded-lg border-2 transition-colors ${
                            feedbackRating >= rating
                              ? 'border-accent-500 bg-accent-500/20 text-accent-400'
                              : 'border-gray-600 text-gray-500 hover:border-gray-500'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comments (optional)</label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                      placeholder="Share your thoughts about this session..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleSubmitFeedback}
                      className="px-6 py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-4 left-6 right-6 max-w-4xl mx-auto bg-red-900/90 backdrop-blur-sm border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdviceChatPage;
