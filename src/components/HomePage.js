/**
 * HomePage Component
 * 
 * Professional landing page with dark aquarium theme:
 * - Hero section with image (below navbar, no overlap)
 * - Destination cards for Community Chat and Private Chat
 * - Professional, immersive design
 * - Navbar integration with hamburger menu
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Navbar from './Navbar';

const HomePage = () => {
  const { isAuthenticated } = useUser();

  // Public landing page (not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        
        {/* Hero Section - With proper top spacing to not block navbar */}
        <div className="relative bg-gradient-to-br from-dark-900 via-ocean-900 to-dark-900 text-white overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/hero/hero1.png"
              alt="Aquarium"
              className="w-full h-full object-cover opacity-20"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/40 to-dark-900/60"></div>
          
          <div className="relative section-container pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
                A place for serious aquarium hobbyists
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl">
                Connect with experienced tank keepers. Learn from real experience, avoid costly mistakes, and share knowledge across freshwater, saltwater, reef, and planted tanks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-4 text-base"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 text-base font-medium rounded-lg border-2 border-ocean-500/50 bg-ocean-600/20 backdrop-blur-sm text-white hover:bg-ocean-600/30 hover:border-ocean-500 transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Sections */}
        <div className="section-container py-20 md:py-28">
          {/* Section 1: Learning from Experience */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-100 mb-6 leading-tight">
                Learn from real experience
              </h2>
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <p>
                  Get advice from hobbyists who've faced the same challenges you're experiencing. Whether you're troubleshooting water chemistry issues or planning your next aquascape, learn from those who've been there.
                </p>
                <p>
                  Our community spans all experience levels and tank types, ensuring you can find relevant guidance for your specific situation.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden bg-dark-800 border border-dark-600 shadow-xl">
              <img
                src="/images/hero/hero2.png"
                alt="Aquarium tank"
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'relative h-96 rounded-xl overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600 shadow-xl';
                }}
              />
            </div>
          </div>

          {/* Section 2: Avoid Mistakes */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 relative h-96 rounded-xl overflow-hidden bg-dark-800 border border-dark-600 shadow-xl">
              <img
                src="/images/hero/hero1.png"
                alt="Coral reef"
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'relative h-96 rounded-xl overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600 shadow-xl';
                }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-100 mb-6 leading-tight">
                Avoid costly mistakes
              </h2>
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <p>
                  Equipment choices, stocking decisions, and maintenance routines can be expensive to get wrong. Connect with experienced keepers to make informed decisions before you invest.
                </p>
                <p>
                  Our topic-based matching helps you find the right experts for your specific questions, whether you're working with freshwater communities or advanced reef systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Destinations Section */}
        <div className="bg-dark-800/50 py-20 md:py-28">
          <div className="section-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-100 mb-4">
                Start Connecting
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join the community and choose how you'd like to connect with other aquarium hobbyists
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Community Chat Card */}
              <div className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300">
                <div className="mb-6 h-48 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
                  <img
                    src="/images/community-chat/communitychat.jpeg"
                    alt="Community Chat"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.className = 'mb-6 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                    }}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
                  Community Chat
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Join open discussions across all tank types and experience levels. Share experiences, ask questions, and learn from the community.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center btn-primary"
                >
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Private Chat Card */}
              <div className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300">
                <div className="mb-6 h-48 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
                  <img
                    src="/images/private-chat/privatechat.png"
                    alt="Private Chat"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.className = 'mb-6 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                    }}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
                  Private Chat
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get matched with experienced hobbyists for personalized 1-on-1 advice. Focused conversations on specific topics and challenges.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center btn-primary"
                >
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* AI Advisor Card */}
              <div className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300">
                <div className="mb-6 h-48 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
                  <img
                    src="/images/ai/ai-advisor1.png"
                    alt="AI Advisor"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.className = 'mb-6 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                    }}
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
                  AI Advisor
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get instant help from an AI trained on aquarium care, reef systems, and freshwater tanks.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center btn-primary"
                >
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="section-container py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-100 mb-4">
              Ready to connect with other hobbyists?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join the community and start learning from experienced tank keepers today.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center btn-primary px-8 py-4 text-base"
            >
              Create your account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated users see a welcome page with quick actions
  // Note: This is wrapped in AuthenticatedLayout, which includes Navbar
  return (
    <>
      {/* Hero Section for Authenticated Users */}
      <div className="relative bg-gradient-to-br from-dark-900 via-ocean-900 to-dark-900 text-white overflow-hidden -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 mb-8">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/images/hero/hero1.png"
            alt="Aquarium"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/40 to-dark-900/60"></div>
        
        <div className="relative section-container pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Welcome back
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Continue your conversations, get expert advice, and share your aquarium journey with the community.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-3">
            Choose how to connect
          </h2>
          <p className="text-lg text-gray-300">
            Join conversations or get personalized advice
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            to="/general-chat"
            className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300"
          >
            <div className="mb-6 h-40 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
              <img
                src="/images/home-cards/community-chat/community.jpeg"
                alt="Community Chat"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'mb-6 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
              Community Chat
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Join open discussions across all tank types and experience levels
            </p>
            <div className="flex items-center text-ocean-400 font-medium">
              <span>Go to Community Chat</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/topic-chats"
            className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300"
          >
            <div className="mb-6 h-40 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
              <img
                src="/images/home-cards/private-chat/privatechat.jpeg"
                alt="Private Chat"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'mb-6 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
              Private Chat
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Get matched with experts for personalized advice on specific topics
            </p>
            <div className="flex items-center text-ocean-400 font-medium">
              <span>Go to Private Chat</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/ai-advisor"
            className="group glass-card p-8 hover:border-ocean-500/50 transition-all duration-300"
          >
            <div className="mb-6 h-40 rounded-lg overflow-hidden bg-dark-900 border border-dark-600">
              <img
                src="/images/home-cards/ai-advisor/aichat.jpeg"
                alt="AI Advisor"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.className = 'mb-6 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-ocean-900/50 to-dark-800 border border-dark-600';
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-ocean-400 transition-colors">
              AI Advisor
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Get instant help from an AI trained on aquarium care, reef systems, and freshwater tanks.
            </p>
            <div className="flex items-center text-ocean-400 font-medium">
              <span>Go to AI Advisor</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomePage;
