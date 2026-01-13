/**
 * TopicChatsPage Component
 * 
 * Private chat selection with dark theme:
 * - Topic selection interface
 * - Hierarchical category selection
 * - Professional dark layout with images
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import CategorySelector from './CategorySelector';

const ADVICE_TOPICS = [
  'Fish',
  'Plants',
  'Coral',
  'Water Chemistry',
  'Equipment'
];

const TopicChatsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * Handle topic selection and navigation to advice chat
   */
  const handleFindMatch = () => {
    navigate('/advice-chat', {
      state: {
        userData: {
          userId: user.id,
          username: user.username,
          level: user.level
        },
        topic: selectedCategory?.name || selectedTopic || null
      }
    });
  };

  /**
   * Handle category selection
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedTopic('');
    setShowCategories(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-100">Private Chat</h1>
        <p className="mt-1 text-sm text-gray-400">
          Get matched with experienced hobbyists for personalized advice
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Topic Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Selection Toggle */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-100">Browse by Category</h2>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="px-3 py-1.5 text-xs font-medium text-ocean-400 bg-ocean-600/20 border border-ocean-500/50 rounded-lg hover:bg-ocean-600/30 transition-all"
              >
                {showCategories ? 'Hide' : 'Show'}
              </button>
            </div>

            {showCategories && (
              <CategorySelector 
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            )}
          </div>

          {/* Simple Topic Selection */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-100 mb-1">Or Select Topic (Optional)</h2>
              <p className="text-sm text-gray-400">
                Choose a topic to match with relevant experts, or leave blank for general advice
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedTopic('');
                  setSelectedCategory(null);
                }}
                className={`
                  w-full px-4 py-3 text-left text-sm rounded-lg border transition-all
                  ${!selectedTopic && !selectedCategory
                    ? 'border-ocean-500 bg-ocean-600/20 text-ocean-400'
                    : 'border-dark-600 bg-dark-700/50 text-gray-300 hover:bg-dark-700 hover:border-dark-500'
                  }
                `}
              >
                Any Topic
              </button>
              {ADVICE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setSelectedCategory(null);
                  }}
                  className={`
                    w-full px-4 py-3 text-left text-sm rounded-lg border transition-all
                    ${selectedTopic === topic
                      ? 'border-ocean-500 bg-ocean-600/20 text-ocean-400'
                      : 'border-dark-600 bg-dark-700/50 text-gray-300 hover:bg-dark-700 hover:border-dark-500'
                    }
                  `}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Context & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Level Info */}
          <div className="card bg-dark-700/50">
            <h3 className="text-sm font-semibold text-gray-100 mb-3">Your Experience</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Level</div>
                <div className="text-base font-medium text-gray-100">{user.level}</div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                You'll be matched with users based on your experience level to ensure relevant conversations.
              </p>
            </div>
          </div>

          {/* Selected Category Display */}
          {selectedCategory && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-100 mb-3">Selected Category</h3>
              <div className="space-y-3">
                <div className="h-32 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-100">{selectedCategory.name}</div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-100 mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-ocean-400 mr-2 mt-0.5">•</span>
                <span>Select a category or topic, or leave blank</span>
              </li>
              <li className="flex items-start">
                <span className="text-ocean-400 mr-2 mt-0.5">•</span>
                <span>We'll match you with an experienced hobbyist</span>
              </li>
              <li className="flex items-start">
                <span className="text-ocean-400 mr-2 mt-0.5">•</span>
                <span>Have a focused 1-on-1 conversation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Find Match Button */}
      <div className="mt-8">
        <button
          onClick={handleFindMatch}
          className="w-full btn-primary py-3"
        >
          Find Match
        </button>
      </div>
    </div>
  );
};

export default TopicChatsPage;
