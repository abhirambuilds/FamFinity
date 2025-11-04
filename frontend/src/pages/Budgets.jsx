import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetsAPI, authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import LOCALE_CONFIG from '../config/locale';

const Budgets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [budgetData, setBudgetData] = useState({
    income: 5000,
    savings_goal: 1000,
    bills_utilities: 0,
    housing: 0,
    food: 0,
    transportation: 0,
    healthcare: 0,
    entertainment: 0,
    shopping: 0,
    education: 0,
    other: 0,
  });

  useEffect(() => {
    loadUser();
    loadExistingBudget();
  }, [month]);

  const loadUser = async () => {
    try {
      const userResp = await authAPI.getCurrentUser();
      setUser(userResp);
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const loadExistingBudget = async () => {
    try {
      const resp = await budgetsAPI.getCurrentBudget(month);
      if (resp.budget) {
        setBudgetData({
          income: resp.budget.income || 0,
          savings_goal: resp.budget.savings_goal || 0,
          bills_utilities: resp.budget.bills_utilities || 0,
          housing: resp.budget.housing || 0,
          food: resp.budget.food || 0,
          transportation: resp.budget.transportation || 0,
          healthcare: resp.budget.healthcare || 0,
          entertainment: resp.budget.entertainment || 0,
          shopping: resp.budget.shopping || 0,
          education: resp.budget.education || 0,
          other: resp.budget.other || 0,
        });
      }
    } catch (err) {
      console.log('No existing budget for this month');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        month,
        ...budgetData
      };

      const resp = await budgetsAPI.createBudget(payload);
      setSuccess('Budget saved successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return LOCALE_CONFIG.currency.format(amount);
  };

  const totalExpenses = Object.entries(budgetData)
    .filter(([key]) => !['income', 'savings_goal'].includes(key))
    .reduce((sum, [, value]) => sum + parseFloat(value || 0), 0);

  const leftToBudget = budgetData.income - budgetData.savings_goal - totalExpenses;

  const expenseCategories = [
    { key: 'bills_utilities', label: 'Bills & Utilities', icon: '⚡', subcategories: ['Garbage', 'Water', 'Electricity', 'Internet & Cable', 'Phone'] },
    { key: 'housing', label: 'Housing', icon: '🏠', subcategories: ['Mortgage', 'Rent', 'Home Improvement'] },
    { key: 'food', label: 'Food', icon: '🍽️', subcategories: ['Groceries', 'Dining Out'] },
    { key: 'transportation', label: 'Transportation', icon: '🚗', subcategories: ['Fuel', 'Public Transport', 'Vehicle Maintenance'] },
    { key: 'healthcare', label: 'Healthcare', icon: '🏥', subcategories: ['Medical', 'Insurance'] },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬', subcategories: ['Movies', 'OTT', 'Events'] },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', subcategories: ['Clothing', 'Electronics', 'Gifts'] },
    { key: 'education', label: 'Education', icon: '📚', subcategories: ['Tuition', 'Books', 'Courses'] },
    { key: 'other', label: 'Other', icon: '📝', subcategories: [] },
  ];

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl mx-auto overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white break-words" style={{ wordBreak: 'break-word' }}>Create a Budget</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-6 flex-wrap">
            <StepIndicator
              step={1}
              label="Income"
              active={step === 1}
              completed={step > 1}
              onClick={() => setStep(1)}
            />
            <div className="w-12 sm:w-24 h-1 bg-gray-700">
              <div className={`h-1 ${step > 1 ? 'bg-purple-600' : 'bg-gray-700'} transition-all`}></div>
            </div>
            <StepIndicator
              step={2}
              label="Savings"
              active={step === 2}
              completed={step > 2}
              onClick={() => setStep(2)}
            />
            <div className="w-12 sm:w-24 h-1 bg-gray-700">
              <div className={`h-1 ${step > 2 ? 'bg-purple-600' : 'bg-gray-700'} transition-all`}></div>
            </div>
            <StepIndicator
              step={3}
              label="Expenses"
              active={step === 3}
              completed={false}
              onClick={() => setStep(3)}
            />
          </div>

          {/* Month Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          {step === 1 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 break-words" style={{ wordBreak: 'break-word' }}>Step 1. Enter your monthly income</h2>
              <div className="max-w-md w-full">
                <label className="block text-sm font-medium text-gray-300 mb-2 break-words" style={{ wordBreak: 'break-word' }}>
                  Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={budgetData.income}
                    onChange={(e) => setBudgetData({ ...budgetData, income: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your total monthly income including salary, investments, etc.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Step 2. Set your savings goal</h2>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Savings Goal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={budgetData.savings_goal}
                    onChange={(e) => setBudgetData({ ...budgetData, savings_goal: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Recommended: 20-30% of income ({formatCurrency(budgetData.income * 0.2)} - {formatCurrency(budgetData.income * 0.3)})
                </p>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setBudgetData({ ...budgetData, savings_goal: budgetData.income * 0.2 })}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    20%
                  </button>
                  <button
                    onClick={() => setBudgetData({ ...budgetData, savings_goal: budgetData.income * 0.3 })}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    30%
                  </button>
                  <button
                    onClick={() => setBudgetData({ ...budgetData, savings_goal: budgetData.income * 0.4 })}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    40%
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Step 3. Enter your monthly expenses</h2>
              
              <div className="space-y-6">
                {expenseCategories.map((category) => (
                  <div key={category.key} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{category.label}</h3>
                          {category.subcategories.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {category.subcategories.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="relative w-32">
                        <span className="absolute left-2 top-2 text-gray-500 text-sm">₹</span>
                        <input
                          type="number"
                          value={budgetData[category.key]}
                          onChange={(e) => setBudgetData({
                            ...budgetData,
                            [category.key]: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg text-right"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                  <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
                  <h3 className="font-semibold text-purple-300 mb-3 whitespace-nowrap">Budget Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300 whitespace-nowrap">Income:</span>
                      <span className="font-semibold text-white whitespace-nowrap">{formatCurrency(budgetData.income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 whitespace-nowrap">Savings Goal:</span>
                      <span className="font-semibold text-green-400 whitespace-nowrap">-{formatCurrency(budgetData.savings_goal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 whitespace-nowrap">Total Expenses:</span>
                      <span className="font-semibold text-red-400 whitespace-nowrap">-{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="border-t border-purple-700 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-white whitespace-nowrap">Left to Budget:</span>
                      <span className={`font-bold whitespace-nowrap ${leftToBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(leftToBudget)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || leftToBudget < 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Budget'}
              </button>
            )}
          </div>
        </div>

        {/* Budget Preview Sidebar */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Budget Preview</h3>
          <DonutChart
            income={budgetData.income}
            savings={budgetData.savings_goal}
            expenses={totalExpenses}
          />
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-purple-600"></div>
                <span className="text-gray-600">Income</span>
              </div>
              <span className="font-semibold">{formatCurrency(budgetData.income)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-gray-600">Savings</span>
              </div>
              <span className="font-semibold">{formatCurrency(budgetData.savings_goal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-gray-600">Expenses</span>
              </div>
              <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-gray-600">Left to budget</span>
              </div>
              <span className="font-semibold">{formatCurrency(Math.max(0, leftToBudget))}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const StepIndicator = ({ step, label, active, completed, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center cursor-pointer"
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
        completed
          ? 'bg-purple-600 text-white'
          : active
          ? 'bg-purple-600 text-white ring-4 ring-purple-300/50'
          : 'bg-gray-700 text-gray-400'
      }`}
    >
      {completed ? '✓' : step}
    </div>
    <span className={`mt-2 text-sm font-medium whitespace-nowrap ${active ? 'text-purple-400' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

const DonutChart = ({ income, savings, expenses }) => {
  const total = income;
  const savingsPercent = total > 0 ? (savings / total) * 100 : 0;
  const expensesPercent = total > 0 ? (expenses / total) * 100 : 0;

  return (
    <div className="flex justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="12"
            strokeDasharray={`${savingsPercent * 2.51} 251`}
            strokeDashoffset="0"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="12"
            strokeDasharray={`${expensesPercent * 2.51} 251`}
            strokeDashoffset={`-${savingsPercent * 2.51}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500">Income</p>
          <p className="text-lg font-bold text-gray-900">{LOCALE_CONFIG.currency.format(income)}</p>
        </div>
      </div>
    </div>
  );
};

export default Budgets;

