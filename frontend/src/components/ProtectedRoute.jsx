import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

/**
 * Protected Route Component
 * 
 * Ensures user is:
 * 1. Logged in (has token)
 * 2. Has completed onboarding (answered 15 questions)
 * 
 * If not logged in -> redirect to /signin
 * If not onboarded -> redirect to /onboarding
 */
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      // Check if user has token
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token and get user info including onboarding status
        const userInfo = await authAPI.getCurrentUser();
        
        setIsAuthenticated(true);
        setIsOnboarded(userInfo.onboarding_complete || false);
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Authenticated but not onboarded -> redirect to onboarding
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated and onboarded -> show the protected content
  return children;
};

export default ProtectedRoute;

