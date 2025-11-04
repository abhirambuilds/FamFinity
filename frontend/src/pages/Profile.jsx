import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const resp = await authAPI.getCurrentUser();
      setUser(resp);
      setFormData({
        name: resp.name || '',
        email: resp.email || ''
      });
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    navigate('/signin');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Note: You'd need to implement a user update endpoint in the backend
    alert('Profile update feature coming soon!');
    setEditing(false);
  };

  return (
    <AppLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Profile Card */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 flex-wrap">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white break-words" style={{ wordBreak: 'break-word' }}>{user?.name || 'User'}</h2>
              <p className="text-sm sm:text-base text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>{user?.email || ''}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 break-words" style={{ wordBreak: 'break-word' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-700 bg-[#2a2a2a] text-white rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 break-words" style={{ wordBreak: 'break-word' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-700 bg-[#2a2a2a] text-white rounded-lg text-sm"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1 break-words">Email cannot be changed</p>
              </div>

              <div className="flex space-x-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-3 sm:px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 flex-shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex-shrink-0"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 break-words" style={{ wordBreak: 'break-word' }}>Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-700 flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white break-words" style={{ wordBreak: 'break-word' }}>Onboarding Status</p>
                <p className="text-sm text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>Complete your financial profile</p>
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-3 sm:px-4 py-2 text-sm text-purple-400 hover:text-purple-300 flex-shrink-0 whitespace-nowrap"
              >
                View Questions →
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700 flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white break-words" style={{ wordBreak: 'break-word' }}>Data & Privacy</p>
                <p className="text-sm text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>Manage your data and privacy settings</p>
              </div>
              <button className="px-3 sm:px-4 py-2 text-sm text-purple-400 hover:text-purple-300 flex-shrink-0 whitespace-nowrap">
                Manage →
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700 flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white break-words" style={{ wordBreak: 'break-word' }}>Export Data</p>
                <p className="text-sm text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>Download all your financial data</p>
              </div>
              <button className="px-3 sm:px-4 py-2 text-sm text-purple-400 hover:text-purple-300 flex-shrink-0 whitespace-nowrap">
                Export →
              </button>
            </div>

            <div className="flex items-center justify-between py-3 flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white break-words" style={{ wordBreak: 'break-word' }}>Change Password</p>
                <p className="text-sm text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>Update your account password</p>
              </div>
              <button className="px-3 sm:px-4 py-2 text-sm text-purple-400 hover:text-purple-300 flex-shrink-0 whitespace-nowrap">
                Change →
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 break-words" style={{ wordBreak: 'break-word' }}>App Information</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Login:</span>
              <span className="font-medium">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Account Created:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-red-800/50 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2 text-sm text-gray-500">
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-purple-600">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600">Help & Support</a>
          </div>
          <p>© 2024 FamFinity. Made in India 🇮🇳</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;

