import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, handleAPIError } from '../api';
import Logo from '../assets/logo-mark.svg';

const SignUp = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Store registration data temporarily in localStorage
      // Account will only be created after all 3 steps are complete
      localStorage.setItem('pending_signup', JSON.stringify({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        timestamp: Date.now()
      }));
      
      // Always redirect to onboarding after signup
      // New users must complete 15 questions and upload CSV before account is created
      navigate('/onboarding');
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#120b25' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: '#120b25' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center flex-shrink-0">
              <div className="w-10 h-10 mr-3 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12C8 12 12 8 20 8C28 8 32 12 32 12" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M8 28C8 28 12 32 20 32C28 32 32 28 32 28" stroke="#c2f52f" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <Link to="/" className="text-2xl font-medium text-white" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-0.5px' }}>
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
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Up Form Section */}
      <div className="flex-1 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-4xl md:text-5xl font-medium text-white mb-4" style={{ fontFamily: '"Inter Tight", sans-serif', letterSpacing: '-1.5px', lineHeight: '120%' }}>
            Create your account
          </h2>
          <p className="mt-4 text-center text-lg" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
            Or{' '}
            <Link to="/signin" className="font-medium transition-colors hover:opacity-80" style={{ color: '#6246e9', fontFamily: '"Inter Tight", sans-serif' }}>
              login to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-10 px-8 rounded-2xl" style={{ backgroundColor: '#221e2f' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4', fontFamily: '"Inter Tight", sans-serif' }}>
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                    style={{ backgroundColor: '#120b25', border: '1px solid #221e2f', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                    onFocus={(e) => e.target.style.borderColor = '#6246e9'}
                    onBlur={(e) => e.target.style.borderColor = '#221e2f'}
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
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
                <div className="rounded-lg p-4" style={{ backgroundColor: '#3f1f1f', border: '1px solid #5f1f1f' }}>
                  <div className="text-sm" style={{ color: '#ff6b6b', fontFamily: '"Inter Tight", sans-serif' }}>{error}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: '#6246e9', color: 'white', fontFamily: '"Inter Tight", sans-serif' }}
                >
                  {loading ? 'Creating account...' : 'Get Started'}
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

export default SignUp;
