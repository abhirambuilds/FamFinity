import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const AppLayout = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    navigate('/signin');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Budgets', path: '/budgets', icon: '💰' },
    { name: 'Expenses', path: '/expenses', icon: '💸' },
    { name: 'Goals', path: '/goals', icon: '🎯' },
    { name: 'AI Finance Advisor', path: '/advisor', icon: '🤖' },
    { name: 'AI Chatbot', path: '/chatbot', icon: '💬' },
    { name: 'Investment Plans', path: '/investments', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden" style={{ width: '100%', maxWidth: '100vw' }}>
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? 'w-16 sm:w-20' : 'w-56 sm:w-64'
        } bg-[#1f1f1f] text-white flex flex-col transition-all duration-300 border-r border-gray-800 flex-shrink-0 overflow-x-hidden`}
        style={{ maxWidth: '100%' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💎</div>
              <span className="text-xl font-bold">FamFinity</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className={`mb-4 ${sidebarCollapsed ? 'text-center' : ''}`}>
            <p className={`text-xs uppercase tracking-wide text-gray-500 ${sidebarCollapsed ? 'hidden' : 'px-3'}`}>
              Main
            </p>
          </div>
          
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'space-x-3'
              } px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile at bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a1a]">
        {/* Top Bar */}
        <header className="bg-[#1a1a1a] border-b border-gray-800">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white break-words whitespace-nowrap overflow-hidden text-ellipsis" style={{ wordBreak: 'keep-all' }}>
                  {navigation.find(n => n.path === location.pathname)?.name || 'FamFinity'}
                </h1>
                <p className="text-sm text-gray-400 mt-1 break-words">
                  Welcome back, {user?.name || 'User'}
                </p>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#1a1a1a] overflow-x-auto android-scroll-x smooth-scroll-x" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="p-4 sm:p-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

