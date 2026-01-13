/**
 * RegisterPage Component
 * 
 * Premium registration form with dark theme:
 * - Navbar integration
 * - Professional form design with grouped sections
 * - Clear hierarchy and spacing
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { validateRegistration } from '../utils/validation';
import Navbar from './Navbar';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TANK_TYPES = ['Freshwater', 'Saltwater', 'Reef', 'Brackish', 'Other'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useUser();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    level: 'Beginner',
    tankType: '',
    tankSize: '',
    favoriteFish: '',
    favoritePlants: '',
    favoriteCoral: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate form using validation utility
    const validation = validateRegistration(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Prepare user data
    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
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

    // Register user
    const result = await register(userData);

    if (result.success) {
      // Redirect to home
      navigate('/');
    } else {
      setErrors({ general: result.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <div className="section-container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-100 mb-2">Create account</h1>
            <p className="text-sm text-gray-400">Join the community</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300">
              <p className="font-medium text-sm">{errors.general}</p>
            </div>
          )}

          {/* Registration Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`input-field ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Choose a username"
                    required
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="At least 6 characters"
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Experience Level and Tank Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tank Type
                  </label>
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
              </div>

              {/* Tank Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tank Size (gallons/liters)
                </label>
                <input
                  type="text"
                  name="tankSize"
                  value={formData.tankSize}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 50 gallons"
                />
              </div>

              {/* Favorite Fish, Plants, and Coral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Fish
                  </label>
                  <input
                    type="text"
                    name="favoriteFish"
                    value={formData.favoriteFish}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Comma-separated (e.g., Betta, Guppy, Tetra)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Plants
                  </label>
                  <input
                    type="text"
                    name="favoritePlants"
                    value={formData.favoritePlants}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Comma-separated (e.g., Java Fern, Anubias)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favorite Coral
                  </label>
                  <input
                    type="text"
                    name="favoriteCoral"
                    value={formData.favoriteCoral}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Comma-separated (e.g., Acropora, Zoanthids)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-ocean-400 hover:text-ocean-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
