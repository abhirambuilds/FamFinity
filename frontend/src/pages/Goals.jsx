import React, { useState, useEffect } from 'react';
import { goalsAPI, authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import LOCALE_CONFIG from '../config/locale';

const Goals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    deadline: ''
  });

  useEffect(() => {
    loadUser();
    loadGoals();
  }, []);

  const loadUser = async () => {
    try {
      const resp = await authAPI.getCurrentUser();
      setUser(resp);
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const loadGoals = async () => {
    try {
      const resp = await goalsAPI.getGoals();
      setGoals(resp.goals || []);
    } catch (err) {
      console.error('Failed to load goals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const resp = await goalsAPI.createGoal({
        title: formData.title,
        price: parseFloat(formData.price),
        deadline: formData.deadline || null
      });
      
      setSuggestions(resp.suggestions);
      setFormData({ title: '', price: '', deadline: '' });
      loadGoals();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal?')) return;
    
    try {
      await goalsAPI.deleteGoal(goalId);
      loadGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const formatCurrency = (amount) => LOCALE_CONFIG.currency.format(amount);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
            <p className="text-gray-500">Set goals and get AI-powered suggestions to achieve them</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setSuggestions(null); }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., New Car, Vacation, Emergency Fund"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="100000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setSuggestions(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Get AI Suggestions'}
                </button>
              </div>
            </form>

            {/* AI Suggestions */}
            {suggestions && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI Suggestions to Achieve Your Goal
                </h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-purple-800 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;
            
            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Target Amount</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(goal.price)}</p>
                </div>

                {goal.deadline && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Target Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(goal.deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {daysLeft !== null && (
                      <p className={`text-xs mt-1 ${daysLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Created: {new Date(goal.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            );
          })}
        </div>

        {goals.length === 0 && !showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">No goals yet. Start planning your financial future!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Create your first goal
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Goals;

