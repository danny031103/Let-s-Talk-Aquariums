/**
 * App Component
 * 
 * Main application component that sets up routing:
 * - HomePage (landing/welcome page)
 * - RegisterPage / LoginPage (authentication)
 * - GeneralChatPage (general chat room selection)
 * - TopicChatsPage (topic-based advice chat)
 * - ProfilePage (user profile)
 * - GeneralRoomPage / AdviceChatPage (chat interfaces)
 * 
 * Wrapped with UserProvider for authentication state management
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import GeneralChatPage from './components/GeneralChatPage';
import TopicChatsPage from './components/TopicChatsPage';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import GeneralRoomPage from './components/GeneralRoomPage';
import AdviceChatPage from './components/AdviceChatPage';
import AiAdvisorPage from './components/AiAdvisorPage';

// Layout wrapper for authenticated pages (with sidebar on desktop, navbar for mobile)
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrapper for HomePage that conditionally applies layout
const HomePageWrapper = () => {
  const { isAuthenticated } = useUser();
  
  if (isAuthenticated) {
    return (
      <AuthenticatedLayout>
        <HomePage />
      </AuthenticatedLayout>
    );
  }
  
  return <HomePage />;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Home page - conditionally wrapped */}
          <Route path="/" element={<HomePageWrapper />} />
          
          {/* Public routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Authenticated routes with sidebar */}
          <Route 
            path="/general-chat" 
            element={
              <AuthenticatedLayout>
                <GeneralChatPage />
              </AuthenticatedLayout>
            } 
          />
          <Route 
            path="/topic-chats" 
            element={
              <AuthenticatedLayout>
                <TopicChatsPage />
              </AuthenticatedLayout>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <AuthenticatedLayout>
                <LeaderboardPage />
              </AuthenticatedLayout>
            } 
          />
          <Route 
            path="/ai-advisor" 
            element={
              <AuthenticatedLayout>
                <AiAdvisorPage />
              </AuthenticatedLayout>
            } 
          />
          
          {/* Chat room pages (full screen) */}
          <Route path="/general-room" element={<GeneralRoomPage />} />
          <Route path="/advice-chat" element={<AdviceChatPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
