/**
 * ProfilePage Component
 * 
 * Professional profile page with dark aquarium theme:
 * - Split layout with imagery
 * - Grouped sections in cards
 * - Clear visual hierarchy
 * - Premium form design
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { profileAPI, gamificationAPI } from '../services/api';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TANK_TYPES = ['Freshwater', 'Saltwater', 'Reef', 'Brackish', 'Other'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated, refreshUser, uploadProfilePicture } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        level: user.level || 'Beginner',
        tankType: user.tankType || '',
        tankSize: user.tankSize || '',
        favoriteFish: (user.favoriteFish || []).join(', '),
        favoritePlants: (user.favoritePlants || []).join(', '),
        favoriteCoral: (user.favoriteCoral || []).join(', ')
      });
    }
  }, [user]);

  // Load gamification stats
  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          const response = await gamificationAPI.getUserStats(user.id);
          if (response.success) {
            setStats(response.stats);
          } else {
            setStats({
              badges: user.badges || [],
              points: user.points || 0,
              level: user.level || 'Beginner'
            });
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
          setStats({
            badges: user.badges || [],
            points: user.points || 0,
            level: user.level || 'Beginner'
          });
        }
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  /**
   * Handle profile picture upload
   */
  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        refreshUser();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload picture.' });
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updates = {
      username: formData.username.trim(),
      level: formData.level,
      tankType: formData.tankType || null,
      tankSize: formData.tankSize || null,
      favoriteFish: formData.favoriteFish
        .split(',')
        .map(f => f.trim())
        .filter(f => f),
      favoritePlants: formData.favoritePlants
        .split(',')
        .map(p => p.trim())
        .filter(p => p),
      favoriteCoral: formData.favoriteCoral
        .split(',')
        .map(c => c.trim())
        .filter(c => c)
    };

    const result = await updateProfile(updates);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      level: user.level || 'Beginner',
      tankType: user.tankType || '',
      tankSize: user.tankSize || '',
      favoriteFish: (user.favoriteFish || []).join(', '),
      favoritePlants: (user.favoritePlants || []).join(', '),
      favoriteCoral: (user.favoriteCoral || []).join(', ')
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-100">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-700/50 text-green-300'
              : 'bg-red-900/30 border-red-700/50 text-red-300'
          }`}
        >
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      {!isEditing ? (
        /* View Mode */
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Header */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700 border-2 border-dark-600 shadow-lg flex items-center justify-center">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/profile/avatar/placeholder.png';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <img
                        src="/images/profile/avatar/placeholder.png"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-4xl font-semibold text-gray-300">${user.username?.charAt(0).toUpperCase() || 'U'}</span>`;
                        }}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPicture}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-ocean-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 focus:ring-offset-dark-800 transition-all disabled:opacity-50"
                    title="Change profile picture"
                  >
                    {uploadingPicture ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-100 mt-4 mb-1">
                  {user.username}
                </h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>

              {/* Stats */}
              {stats && (
                <div className="border-t border-dark-600 pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Points</span>
                    <span className="text-lg font-semibold text-gray-100">{stats.points || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Achievements</span>
                    <span className="text-lg font-semibold text-gray-100">{stats.badges?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Level</span>
                    <span className="text-lg font-semibold text-gray-100">{user.level}</span>
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <div className="mt-6 pt-6 border-t border-dark-600">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full btn-secondary"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">General Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Experience Level</label>
                  <p className="text-gray-100">{user.level}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tank Type</label>
                  <p className="text-gray-100">{user.tankType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Tank Size</label>
                  <p className="text-gray-100">{user.tankSize || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Favorite Species */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Favorite Species</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Fish</label>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteFish && user.favoriteFish.length > 0 ? (
                      user.favoriteFish.map((fish, index) => (
                        <span key={index} className="px-3 py-1 bg-ocean-600/20 text-ocean-300 border border-ocean-500/50 rounded-full text-sm">
                          {fish}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">None added</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Plants</label>
                  <div className="flex flex-wrap gap-2">
                    {user.favoritePlants && user.favoritePlants.length > 0 ? (
                      user.favoritePlants.map((plant, index) => (
                        <span key={index} className="px-3 py-1 bg-ocean-600/20 text-ocean-300 border border-ocean-500/50 rounded-full text-sm">
                          {plant}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">None added</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Coral</label>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteCoral && user.favoriteCoral.length > 0 ? (
                      user.favoriteCoral.map((coral, index) => (
                        <span key={index} className="px-3 py-1 bg-ocean-600/20 text-ocean-300 border border-ocean-500/50 rounded-full text-sm">
                          {coral}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">None added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {(stats?.badges || user.badges || []).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(stats?.badges || user.badges || []).map((badge, index) => (
                    <div
                      key={index}
                      className="p-3 border border-dark-600 bg-dark-700/50 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-100">{badge.name || `Achievement ${index + 1}`}</p>
                      {badge.description && (
                        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Account</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tank Information */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Tank Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {EXPERIENCE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tank Type</label>
                    <select
                      name="tankType"
                      value={formData.tankType}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select tank type</option>
                      {TANK_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tank Size (gallons/liters)</label>
                    <input
                      type="text"
                      name="tankSize"
                      value={formData.tankSize}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., 50 gallons"
                    />
                  </div>
                </div>
              </div>

              {/* Favorite Species */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Favorite Species</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Favorite Fish</label>
                    <input
                      type="text"
                      name="favoriteFish"
                      value={formData.favoriteFish}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Comma-separated"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Favorite Plants</label>
                    <input
                      type="text"
                      name="favoritePlants"
                      value={formData.favoritePlants}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Comma-separated"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Favorite Coral</label>
                    <input
                      type="text"
                      name="favoriteCoral"
                      value={formData.favoriteCoral}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Comma-separated"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-dark-600">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
