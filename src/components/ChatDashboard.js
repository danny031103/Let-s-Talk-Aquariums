/**
 * ChatDashboard Component
 * 
 * Professional dashboard with structured layouts:
 * - Tabbed interface for chat types
 * - Lists and structured panels instead of button grids
 * - Clear information hierarchy
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const GENERAL_ROOMS = [
  'Freshwater',
  'Saltwater',
  'Reef',
  'Community Tank',
  'Photos & Stories'
];

const ADVICE_TOPICS = [
  'Fish',
  'Plants',
  'Coral',
  'Water chemistry',
  'Equipment'
];

const ChatDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'advice'
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * Handle General Room selection
   */
  const handleGeneralRoom = (room) => {
    navigate('/general-room', {
      state: {
        userData: {
          userId: user.id,
          username: user.username,
          level: user.level
        },
        room: room
      }
    });
  };

  /**
   * Handle Advice Chat selection
   */
  const handleAdviceChat = () => {
    navigate('/advice-chat', {
      state: {
        userData: {
          userId: user.id,
          username: user.username,
          level: user.level
        },
        topic: selectedTopic || null
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Chat</h1>
        <p className="mt-1 text-sm text-gray-500">Join conversations and get advice</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'general'
                ? 'border-accent-500 text-accent-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            General Rooms
          </button>
          <button
            onClick={() => setActiveTab('advice')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'advice'
                ? 'border-accent-500 text-accent-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Advice Chat
          </button>
        </nav>
      </div>

      {/* General Rooms Tab */}
      {activeTab === 'general' && (
        <div className="card p-6">
          <div className="mb-4">
            <h2 className="text-base font-medium text-gray-900 mb-1">Available Rooms</h2>
            <p className="text-sm text-gray-500">Select a room to join the conversation</p>
          </div>

          {/* Rooms List */}
          <div className="divide-y divide-gray-200">
            {GENERAL_ROOMS.map((room, index) => (
              <button
                key={room}
                onClick={() => handleGeneralRoom(room)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{room}</p>
                    <p className="mt-1 text-sm text-gray-500">Join room conversation</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advice Chat Tab */}
      {activeTab === 'advice' && (
        <div className="space-y-6">
          {/* Topic Selection */}
          <div className="card p-6">
            <div className="mb-4">
              <h2 className="text-base font-medium text-gray-900 mb-1">Select Topic (Optional)</h2>
              <p className="text-sm text-gray-500">Choose a topic to match with relevant experts</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedTopic('')}
                className={`
                  w-full px-4 py-2 text-left text-sm rounded-md border transition-colors
                  ${selectedTopic === ''
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                Any Topic
              </button>
              {ADVICE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`
                    w-full px-4 py-2 text-left text-sm rounded-md border transition-colors
                    ${selectedTopic === topic
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Match Info */}
          <div className="card p-6 bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                  <span className="text-accent-600 text-sm">⭐</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Your Level: {user.level}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You'll be matched with users based on your experience level
                </p>
              </div>
            </div>
          </div>

          {/* Start Match Button */}
          <button
            onClick={handleAdviceChat}
            className="w-full btn-primary py-3"
          >
            Find Match
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;
