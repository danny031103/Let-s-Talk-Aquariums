/**
 * Navbar Component
 * 
 * Professional top navigation bar with dark theme:
 * - Sticky positioning with proper spacing
 * - Logo and brand ("Let's Talk Aquariums")
 * - Navigation links
 * - User info and logout
 * - Responsive design with hamburger menu
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Community Chat', href: '/general-chat' },
    { name: 'Private Chat', href: '/topic-chats' },
    { name: 'AI Advisor', href: '/ai-advisor' },
    { name: 'Profile', href: '/profile' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Only show navbar if authenticated or on public pages
  if (!isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/95 backdrop-blur-md border-b border-dark-600 shadow-xl">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-100 tracking-tight">Let's Talk Aquariums</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <>
              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${active
                          ? 'bg-ocean-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* User Info and Logout */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-200">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-100">{user?.username || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            </>
          )}

          {/* Hamburger Menu Button - Always visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Public Pages Auth Links (Desktop) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-lg hover:bg-ocean-700 transition-all shadow-lg"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {(mobileMenuOpen && isAuthenticated) && (
          <div className="md:hidden py-4 border-t border-dark-600">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${active
                        ? 'bg-ocean-600 text-white'
                        : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-left text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Public Pages Mobile Menu */}
        {(mobileMenuOpen && !isAuthenticated) && (
          <div className="md:hidden py-4 border-t border-dark-600">
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
