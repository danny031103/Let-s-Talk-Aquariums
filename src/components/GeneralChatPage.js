/**
 * GeneralChatPage Component
 * 
 * Community chat room selection with dark theme:
 * - Room cards with images
 * - Hierarchical category selection
 * - Professional dark layout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import CategorySelector from './CategorySelector';

const COMMUNITY_ROOMS = [
  { 
    id: 'freshwater', 
    name: 'Freshwater', 
    description: 'Discussions about freshwater tanks, fish, and aquascaping',
    image: '/images/community-chat-rooms/freshwater/plants.jpeg'
  },
  { 
    id: 'saltwater', 
    name: 'Saltwater', 
    description: 'Saltwater aquarium topics and marine life',
    image: '/images/community-chat-rooms/saltwater/saltwatertank.jpeg'
  },
  { 
    id: 'reef', 
    name: 'Reef Systems', 
    description: 'Advanced reef keeping and coral care',
    image: '/images/community-chat-rooms/reef/reeftank.jpeg'
  },
  { 
    id: 'community', 
    name: 'Community Tank', 
    description: 'General community tank discussions',
    image: '/images/community-chat-rooms/community/communitytank.jpeg'
  },
  { 
    id: 'photos', 
    name: 'Photos & Stories', 
    description: 'Share your tank photos and experiences',
    image: '/images/community-chat/communitychat.jpeg'
  },
];

const GeneralChatPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
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
   * Handle room selection and navigation
   */
  const handleJoinRoom = (roomName) => {
    navigate('/general-room', {
      state: {
        userData: {
          userId: user.id,
          username: user.username,
          level: user.level
        },
        room: roomName
      }
    });
  };

  /**
   * Handle category selection
   */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-100">Community Chat</h1>
        <p className="mt-1 text-sm text-gray-400">
          Join open discussions across all tank types and experience levels
        </p>
      </div>

      {/* Category Selection Toggle */}
      <div className="mb-8">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="px-4 py-2 text-sm font-medium text-ocean-400 bg-ocean-600/20 border border-ocean-500/50 rounded-lg hover:bg-ocean-600/30 transition-all"
        >
          {showCategories ? 'Hide Categories' : 'Browse by Category'}
        </button>
      </div>

      {/* Category Selector */}
      {showCategories && (
        <div className="card mb-8">
          <CategorySelector 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMUNITY_ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => handleJoinRoom(room.name)}
            className="group text-left glass-card p-6 hover:border-ocean-500/50 transition-all duration-300"
          >
            <div className="mb-4 h-48 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'mb-4 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                }}
              />
            </div>
            <h3 className="text-base font-semibold text-gray-100 mb-2 group-hover:text-ocean-400 transition-colors">
              {room.name}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {room.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GeneralChatPage;
