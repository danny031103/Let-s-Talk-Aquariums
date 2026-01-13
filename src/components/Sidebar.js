/**
 * Sidebar Component
 * 
 * Professional left sidebar navigation with dark theme:
 * - Desktop-only sidebar (no mobile hamburger - Navbar handles mobile)
 * - Clean, minimal design with text-only navigation
 * - Professional logo/branding ("Let's Talk Aquariums")
 * - Clear active state indicators
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/', exact: true },
    { name: 'Community Chat', href: '/general-chat' },
    { name: 'Private Advice', href: '/topic-chats' },
    { name: 'AI Advisor', href: '/ai-advisor' },
    { name: 'Profile', href: '/profile' },
  ];

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-dark-800 border-r border-dark-600">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center h-16 px-6 border-b border-dark-600">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-100 tracking-tight">Let's Talk Aquariums</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                  ${active
                    ? 'bg-ocean-600/20 text-ocean-400 border-l-2 border-ocean-500'
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="px-6 py-4 border-t border-dark-600">
          {user && (
            <div className="mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-200">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-100 truncate">
                    {user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.level || 'Beginner'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white rounded-lg transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
