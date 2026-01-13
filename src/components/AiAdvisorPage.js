/**
 * AiAdvisorPage Component
 * 
 * AI-powered aquarium advisor chat interface:
 * - Chat-style UI with message bubbles
 * - Context selection (environment, category)
 * - Professional dark theme
 * - Evidence-based advice from AI
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { aiAPI } from '../services/api';

const ENVIRONMENTS = [
  { value: 'saltwater', label: 'Saltwater' },
  { value: 'freshwater', label: 'Freshwater' },
];

const CATEGORIES = [
  { value: 'coral', label: 'Coral' },
  { value: 'fish', label: 'Fish' },
  { value: 'plants', label: 'Plants' },
  { value: 'chemistry', label: 'Water Chemistry' },
  { value: 'stocking', label: 'Stocking' },
  { value: 'general', label: 'General' },
];

const AiAdvisorPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState('freshwater');
  const [category, setCategory] = useState('general');
  const [aiEnabled, setAiEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Initialize environment from user profile
  useEffect(() => {
    if (user?.tankType) {
      const tankType = user.tankType.toLowerCase();
      if (tankType.includes('salt') || tankType === 'reef') {
        setEnvironment('saltwater');
      } else {
        setEnvironment('freshwater');
      }
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI Aquarium Advisor. I can help you with evidence-based advice about your aquarium setup, livestock, and water chemistry. What would you like to know?",
        timestamp: Date.now()
      }]);
    }
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || !aiEnabled) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiAPI.chat({
        message: userMessage.content,
        environment: environment,
        category: category
      });

      const assistantMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if AI is disabled (503 status or unavailable message)
      if (error.status === 503 || (error.data && error.data.enabled === false) || 
          (error.message && error.message.includes('unavailable'))) {
        setAiEnabled(false);
        const disabledMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: 'AI Advisor is currently unavailable. Please check back later or use Community Chat or Private Chat for assistance.',
          timestamp: Date.now(),
          error: true
        };
        setMessages(prev => [...prev, disabledMessage]);
      } else {
        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
          error: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear chat history
   */
  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI Aquarium Advisor. I can help you with evidence-based advice about your aquarium setup, livestock, and water chemistry. What would you like to know?",
      timestamp: Date.now()
    }]);
    setAiEnabled(true); // Reset enabled state on clear
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">AI Advisor</h1>
        <p className="text-sm text-gray-400">
          Get evidence-based help for your aquarium setup, livestock, and water chemistry.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Context Settings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-100 mb-4">Context</h2>
            
            {/* Environment Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="input-field text-sm"
                disabled={!aiEnabled}
              >
                {ENVIRONMENTS.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field text-sm"
                disabled={!aiEnabled}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Card */}
          <div className="card bg-dark-700/50">
            <h3 className="text-sm font-semibold text-gray-100 mb-2">About AI Advisor</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This AI provides conservative, evidence-based advice. Always consult with experienced hobbyists and verify critical information before making significant changes to your aquarium.
            </p>
          </div>

          {/* Disabled State Notice */}
          {!aiEnabled && (
            <div className="card bg-yellow-900/20 border-yellow-700/50">
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">Status</h3>
              <p className="text-xs text-yellow-200 leading-relaxed">
                AI Advisor is currently unavailable. Please use Community Chat or Private Chat for assistance.
              </p>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="card p-0 flex flex-col" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-ocean-600 text-white'
                        : message.error
                        ? 'bg-red-900/30 border border-red-700/50 text-red-300'
                        : 'bg-dark-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-ocean-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-700 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {!aiEnabled && messages.length > 0 && (
                <div className="flex justify-center">
                  <div className="bg-dark-800/80 border border-dark-600 rounded-lg px-6 py-4 max-w-md">
                    <p className="text-sm text-gray-300 text-center">
                      AI Advisor is currently unavailable. Please check back later or use Community Chat or Private Chat for assistance.
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-dark-600 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={aiEnabled ? "Ask a question about your aquarium..." : "AI Advisor is currently unavailable"}
                  className="flex-1 input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !aiEnabled}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim() || !aiEnabled}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="btn-secondary px-4"
                  title="Clear chat"
                >
                  Clear
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisorPage;
