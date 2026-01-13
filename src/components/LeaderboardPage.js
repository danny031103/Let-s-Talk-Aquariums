/**
 * LeaderboardPage Component
 * 
 * Professional leaderboard with editorial layout:
 * - Multi-column layout
 * - Clear data presentation
 * - Premium design
 */

import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';

const LEADERBOARD_TYPES = [
  { id: 'points', label: 'Points' },
  { id: 'messages', label: 'Messages' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'rating', label: 'Rating' },
];

const LeaderboardPage = () => {
  const [leaderboardType, setLeaderboardType] = useState('points');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await gamificationAPI.getLeaderboard(leaderboardType, 100);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top performers in the community
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column - Type Selector */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Category</h2>
            <div className="space-y-2">
              {LEADERBOARD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setLeaderboardType(type.id)}
                  className={`
                    w-full px-4 py-2 text-left text-sm rounded-lg border transition-colors
                    ${leaderboardType === type.id
                      ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard List */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-ocean-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-500">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-base">No leaderboard data available yet.</p>
                <p className="text-sm mt-2">Start participating to climb the ranks.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId || index}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border transition-colors
                      ${index === 0
                        ? 'bg-ocean-50 border-ocean-200'
                        : index === 1
                        ? 'bg-gray-50 border-gray-200'
                        : index === 2
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      <span className={`text-sm font-semibold ${
                        index < 3 ? 'text-ocean-700' : 'text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-ocean-700">
                        {entry.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{entry.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{entry.level || ''}</div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-ocean-600">
                        {entry.score || entry.points || entry.count || entry.rating || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leaderboardType === 'rating' ? 'rating' : leaderboardType === 'sessions' ? 'sessions' : leaderboardType === 'messages' ? 'messages' : 'points'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
