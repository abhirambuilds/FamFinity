import React, { useState, useEffect } from 'react';
import { investmentsAPI, authAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import LOCALE_CONFIG from '../config/locale';

const Investments = () => {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('100000');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allPlans, setAllPlans] = useState(null);

  useEffect(() => {
    loadUser();
    loadAllPlans();
  }, []);

  const loadUser = async () => {
    try {
      const resp = await authAPI.getCurrentUser();
      setUser(resp);
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const loadAllPlans = async () => {
    try {
      const resp = await investmentsAPI.getAllPlans();
      setAllPlans(resp.plans);
    } catch (err) {
      console.error('Failed to load plans');
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setLoading(true);
      const resp = await investmentsAPI.getRecommendations(parseFloat(amount));
      setRecommendations(resp);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => LOCALE_CONFIG.currency.format(amount);

  const getRiskColor = (level) => {
    const colors = {
      1: 'bg-green-100 text-green-800 border-green-300',
      2: 'bg-blue-100 text-blue-800 border-blue-300',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      4: 'bg-orange-100 text-orange-800 border-orange-300',
      5: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level] || colors[3];
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-4 sm:space-y-6 overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white break-words" style={{ wordBreak: 'break-word' }}>Investment Plans</h2>
          <p className="text-sm sm:text-base text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>Get personalized investment recommendations based on your risk profile calculated from all 15 onboarding questions</p>
        </div>

        {/* Investment Amount Input */}
        <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 break-words" style={{ wordBreak: 'break-word' }}>How much do you want to invest?</h3>
          <div className="space-y-4">
            <div className="w-full">
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 text-lg z-10">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-[#2a2a2a] text-white rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="100000"
                  min="0"
                  step="1000"
                  style={{ 
                    fontSize: '1.125rem',
                    letterSpacing: '0.025em'
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Enter the amount you want to invest
              </p>
            </div>
            <button
              onClick={handleGetRecommendations}
              disabled={loading || !amount}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div className="bg-[#252525] rounded-xl shadow-sm p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 break-words" style={{ wordBreak: 'break-word' }}>
                Your Recommended Risk Profile
              </h3>
              <div className={`inline-block px-3 sm:px-4 py-2 rounded-lg border-2 ${getRiskColor(recommendations.risk_level)}`}>
                <p className="font-semibold whitespace-nowrap">
                  Level {recommendations.risk_level}: {recommendations.risk_label}
                </p>
              </div>
              <p className="mt-3 text-gray-400 break-words" style={{ wordBreak: 'break-word' }}>
                Based on your 15 onboarding questions and investment amount of <span className="whitespace-nowrap font-semibold">{formatCurrency(recommendations.amount)}</span>, here are your personalized recommendations:
              </p>
            </div>

            {/* Investment Timeframes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Short Term */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚡</span>
                  Short Term (0-1 year)
                </h4>
                <div className="space-y-3">
                  {recommendations.recommendations.short_term?.map((plan, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-gray-900">{plan.name}</p>
                      <p className="text-xs text-green-600 font-semibold mt-1">{plan.returns}</p>
                      <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium Term */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📅</span>
                  Medium Term (1-3 years)
                </h4>
                <div className="space-y-3">
                  {recommendations.recommendations.medium_term?.map((plan, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-gray-900">{plan.name}</p>
                      <p className="text-xs text-green-600 font-semibold mt-1">{plan.returns}</p>
                      <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long Term */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Long Term (3+ years)
                </h4>
                <div className="space-y-3">
                  {recommendations.recommendations.long_term?.map((plan, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm text-gray-900">{plan.name}</p>
                      <p className="text-xs text-green-600 font-semibold mt-1">{plan.returns}</p>
                      <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Risk Levels */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Understanding Risk Levels</h3>
          <div className="space-y-4">
            {allPlans && Object.values(allPlans).map((plan) => (
              <div key={plan.level} className={`border-2 rounded-lg p-4 ${getRiskColor(plan.level)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Level {plan.level}: {plan.label}</h4>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < plan.level ? 'opacity-100' : 'opacity-30'}`}
                      >
                        ⚡
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  {plan.level === 1 && 'Safest option with guaranteed returns, ideal for conservative investors'}
                  {plan.level === 2 && 'Low risk with stable returns, good for cautious investors'}
                  {plan.level === 3 && 'Balanced risk-return ratio, suitable for most investors'}
                  {plan.level === 4 && 'Higher risk for potentially higher returns, for growth-focused investors'}
                  {plan.level === 5 && 'Highest risk and highest potential returns, for aggressive investors'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <span className="mr-2">⚠️</span>
            Investment Disclaimer
          </h3>
          <p className="text-sm text-yellow-800">
            These are AI-generated recommendations based on general financial principles and your stated risk profile. 
            Past performance does not guarantee future results. Please consult with a certified financial advisor 
            before making any investment decisions. Investments are subject to market risks.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Investments;

