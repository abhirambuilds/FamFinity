import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, handleAPIError } from '../api';
import Logo from '../assets/logo-mark.svg';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);
  const navigate = useNavigate();

  // Keep error visible - scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Keep error visible so user can see what went wrong
    // Error will only clear on new submission or manual dismissal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Don't clear error immediately - wait until we know the result
    const previousError = error;

    try {
      const response = await authAPI.signin(formData);
      
      if (response.success) {
        // Clear error on success
        setError('');
        localStorage.setItem('userId', response.user_id);
        localStorage.setItem('access_token', response.access_token);
        
        // Check if user has completed onboarding
        if (response.onboarding_complete) {
          // User has answered 15 questions -> go to dashboard
          navigate('/dashboard');
        } else {
          // User hasn't completed onboarding -> must answer questions first
          navigate('/onboarding');
        }
      } else {
        // Set error and ensure it persists
        const errorMessage = 'Wrong ID or Password. Please check your credentials and try again.';
        setError(errorMessage);
        // Force a small delay to ensure state update
        setTimeout(() => {
          if (errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (err) {
      const errorInfo = handleAPIError(err);
      let errorMessage = '';
      
      // Check if it's an authentication error (401 or specific auth error messages)
      if (errorInfo.status === 401 || 
          errorInfo.status === 403 || 
          errorInfo.message.toLowerCase().includes('invalid') ||
          errorInfo.message.toLowerCase().includes('incorrect') ||
          errorInfo.message.toLowerCase().includes('wrong') ||
          errorInfo.message.toLowerCase().includes('password') ||
          errorInfo.message.toLowerCase().includes('email') ||
          errorInfo.message.toLowerCase().includes('credentials') ||
          errorInfo.message.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Wrong ID or Password. Please check your credentials and try again.';
      } else {
        errorMessage = errorInfo.message || 'An error occurred. Please try again.';
      }
      
      // Set error and ensure it persists
      setError(errorMessage);
      // Force a small delay to ensure state update and scroll
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#120b25', width: '100%', maxWidth: '100vw' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center flex-shrink-0">
              <div className="w-10 h-10 mr-3 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12C8 12 12 8 20 8C28 8 32 12 32 12" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M8 28C8 28 12 32 20 32C28 32 32 28 32 28" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <Link to="/" className="text-xl sm:text-2xl font-medium text-white" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-0.5px' }}>
                FamFinity
              </Link>
            </div>
            <div className="hidden lg:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-6">
              <Link to="/" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Home</Link>
              <Link to="/about" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>About</Link>
              <Link to="/features" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Features</Link>
              <Link to="/contact" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Contact</Link>
              <Link to="/signin" className="text-white hover:text-white/80 font-medium transition-colors text-sm" style={{ fontFamily: '"Inter Tight", sans-serif' }}>Login</Link>
            </div>
            <div className="hidden md:flex items-center flex-shrink-0">
              <Link to="/signup" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm" style={{ backgroundColor: '#c2f52f', color: '#120b25', fontFamily: '"Inter Tight", sans-serif' }}>
                Get Started
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 touch-manipulation"
                aria-label="Toggle menu"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed top-20 left-0 right-0 w-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto" style={{ backgroundColor: '#120b25', borderTop: '1px solid #221e2f' }}>
              <div className="flex flex-col px-4 py-4 space-y-3">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Home
                </Link>
                <Link 
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  About
                </Link>
                <Link 
                  to="/features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Features
                </Link>
                <Link 
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Contact
                </Link>
                <Link 
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/80 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-white/5 touch-manipulation"
                  style={{ fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm text-center touch-manipulation"
                  style={{ backgroundColor: '#c2f52f', color: '#120b25', fontFamily: '"Inter Tight", sans-serif', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Form Section */}
      <div className="flex-1 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
            Login to your account
          </h2>
          <p className="mt-4 text-center text-lg" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
            Or{' '}
            <Link to="/signup" className="font-medium transition-colors hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
              get started
            </Link>
          </p>
        </div>

        <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-10 px-8 rounded-2xl" style={{ backgroundColor: '#221e2f' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                    style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                    onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                    onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                    style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                    onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                    onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div 
                  ref={errorRef}
                  className="rounded-lg p-4 transition-all duration-300" 
                  style={{ 
                    backgroundColor: '#3f1f1f', 
                    border: '1px solid #ff4444',
                    boxShadow: '0 4px 6px rgba(255, 68, 68, 0.2)',
                    animation: 'slideDown 0.3s ease-out'
                  }}
                  role="alert"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: '#ff6b6b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm font-medium flex-1" style={{ color: '#ff6b6b', fontFamily: '"Inter Tight", sans-serif' }}>{error}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setError('');
                      }}
                      className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
                      style={{ color: '#ff6b6b' }}
                      aria-label="Close error message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: '#6246e9', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 border-t" style={{ backgroundColor: '#120b25', borderColor: '#221e2f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>&copy; 2024 FamFinity. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/about" className="transition-colors hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>About</Link>
              <Link to="/contact" className="transition-colors hover:opacity-80" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;
