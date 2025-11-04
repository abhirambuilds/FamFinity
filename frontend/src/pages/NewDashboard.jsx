import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { uploadAPI, financeAPI, budgetsAPI, authAPI, expensesAPI, handleAPIError } from '../api';
import AppLayout from '../components/AppLayout';
import LOCALE_CONFIG from '../config/locale';

const NewDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [trend, setTrend] = useState([]);
  // Default to current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budgetOverviewPeriod, setBudgetOverviewPeriod] = useState('6months'); // 'lastyear', 'thisyear', '6months'
  const location = useLocation();

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  useEffect(() => {
    loadBudgetOverviewTrend();
  }, [budgetOverviewPeriod]);

  // Refresh data when component becomes visible or when navigating from CSV upload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    
    // Listen for storage events (when CSV upload completes)
    const handleStorageChange = (e) => {
      if (e.key === 'csv_uploaded' || e.key === 'data_refresh') {
        loadDashboardData();
        localStorage.removeItem(e.key);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Also check if we're coming from CSV upload (location state or refresh needed)
    if (location.state?.refresh || sessionStorage.getItem('csv_uploaded')) {
      loadDashboardData();
      sessionStorage.removeItem('csv_uploaded');
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user first (needed for UI)
      const userResp = await authAPI.getCurrentUser();
      setUser(userResp);
      setLoading(false); // Show UI immediately after user loads

      // Load all other data in parallel (non-blocking)
      Promise.all([
        // Load ALL transactions from database (CSV uploaded data)
        Promise.all([
          uploadAPI.getUserTransactions(1000, 0).catch(() => ({ transactions: [] })),
          expensesAPI.getExpenses(selectedMonth, 100, 0).catch(() => ({ expenses: [] }))
        ]).then(([txResp, expensesResp]) => {
          // Combine transactions and manual expenses
          const csvTransactions = (txResp.transactions || []).map(tx => ({
            ...tx,
            source: 'csv',
            description: tx.metadata?.description || tx.category
          }));
          
          const manualExpenses = (expensesResp.expenses || []).map(exp => ({
            id: exp.id,
            date: exp.date,
            amount: -Math.abs(exp.amount), // Make expenses negative
            category: exp.category,
            description: exp.description || exp.category,
            source: 'manual',
            expense_type: exp.expense_type
          }));
          
          // Combine and sort by date (newest first)
          const allTransactions = [...csvTransactions, ...manualExpenses]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setTransactions(allTransactions);
        }).catch(() => {
          setTransactions([]);
        }),

        // Load finance summary
        financeAPI.getSummary({ month: selectedMonth })
          .then(setSummary)
          .catch(() => {}),

        // Load budget
        budgetsAPI.getCurrentBudget(selectedMonth)
          .then(resp => setBudget(resp.budget))
          .catch(() => {})
      ]).catch((err) => {
        console.error('Error loading dashboard data:', err);
      });
    
    // Load budget overview trend data based on selected period
    loadBudgetOverviewTrend();

    } catch (err) {
      const errorInfo = handleAPIError(err);
      console.error('Dashboard error:', errorInfo.message);
      setLoading(false);
    }
  };

  const loadTrendData = async (months) => {
    try {
      const trendResp = await financeAPI.getTrend({ months });
      setTrend(trendResp.series || []);
    } catch (err) {
      console.log('No trend data');
    }
  };

  const loadBudgetOverviewTrend = async () => {
    try {
      let months = 6; // Default to 6 months
      
      if (budgetOverviewPeriod === 'lastyear') {
        // For last year, we need to fetch enough data to include the previous calendar year
        // If current year is 2025, we need Jan 2024 to Dec 2024
        // So we need at least 12 months, but may need more depending on current month
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        // Fetch enough months to ensure we get the full previous year
        // We'll fetch from start of previous year to current month = 12 + currentMonth months
        months = 12 + currentMonth;
      } else if (budgetOverviewPeriod === 'thisyear') {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        months = currentMonth;
      } else if (budgetOverviewPeriod === '6months') {
        months = 6;
      }
      
      const trendResp = await financeAPI.getTrend({ months });
      setTrend(trendResp.series || []);
    } catch (err) {
      console.log('No budget overview trend data');
      setTrend([]);
    }
  };

  const formatCurrency = (amount) => {
    return LOCALE_CONFIG.currency.format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Groceries': '🛒',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Healthcare': '🏥',
      'Education': '📚',
      'Bills': '⚡',
      'Utilities': '💡',
      'Rent': '🏠',
      'Gas': '⛽',
      'Other': '📝'
    };
    return icons[category] || '💰';
  };

  if (loading) {
    return (
      <AppLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  const totalIncome = summary?.total_income || budget?.income || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const savingsGoal = budget?.savings_goal || 0;
  const leftToBudget = totalIncome - savingsGoal - totalExpenses;
  const budgetedExpenses = budget?.total_expenses || 0;

  return (
    <AppLayout user={user}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Top Left - Financial Summary Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#252525] rounded-xl p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white whitespace-nowrap" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed' }}>Financial Overview</h3>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs sm:text-sm border border-gray-700 bg-[#2a2a2a] text-white rounded px-2 sm:px-3 py-1 flex-shrink-0"
              />
            </div>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 min-w-0">
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">Monthly Savings</p>
                <h3 className="text-lg sm:text-2xl font-bold text-green-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(summary?.month_saving || (totalIncome - totalExpenses))}
                </h3>
                <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                  {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 min-w-0">
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">Monthly Budget</p>
                <h3 className="text-lg sm:text-2xl font-bold text-blue-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(totalIncome)}
                </h3>
                <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">Total Income</p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 min-w-0">
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">Total Expenses</p>
                <h3 className="text-lg sm:text-2xl font-bold text-red-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(totalExpenses)}
                </h3>
                <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">This Month</p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 min-w-0">
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">Savings Goal</p>
                <h3 className="text-lg sm:text-2xl font-bold text-purple-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(savingsGoal)}
                </h3>
                <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">Target</p>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-400 mb-4 whitespace-nowrap">Budget Breakdown</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0"></div>
                    <span className="text-sm text-gray-300 whitespace-nowrap">Savings</span>
                  </div>
                  <span className="text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(savingsGoal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0"></div>
                    <span className="text-sm text-gray-300 whitespace-nowrap">Expenses</span>
                  </div>
                  <span className="text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0"></div>
                    <span className="text-sm text-gray-300 whitespace-nowrap">Left to budget</span>
                  </div>
                  <span className="text-sm font-semibold text-white whitespace-nowrap">{formatCurrency(Math.max(0, leftToBudget))}</span>
                </div>
              </div>
              <Link
                to="/budgets"
                className="mt-4 block text-center text-sm text-blue-500 hover:text-blue-400 font-medium"
              >
                Manage budget →
              </Link>
            </div>
          </div>
        </div>

        {/* Top Right - Budget Overview with Stacked Bar Chart */}
        <div className="lg:col-span-7">
          <div className="bg-[#252525] rounded-xl p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white whitespace-nowrap">Budget Overview</h3>
              <div className="flex space-x-2 flex-wrap">
                <button
                  onClick={() => setBudgetOverviewPeriod('lastyear')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    budgetOverviewPeriod === 'lastyear'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  Last Year
                </button>
                <button
                  onClick={() => setBudgetOverviewPeriod('thisyear')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    budgetOverviewPeriod === 'thisyear'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  This Year
                </button>
                <button
                  onClick={() => setBudgetOverviewPeriod('6months')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    budgetOverviewPeriod === '6months'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  6 Months
                </button>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-5 min-h-[80px] sm:min-h-[100px] min-w-0">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Income</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-base sm:text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(totalIncome)}</div>
                <div className="text-xs text-green-400 whitespace-nowrap">+5%</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-5 min-h-[80px] sm:min-h-[100px] min-w-0">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-300 whitespace-nowrap">Expenses</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l-7-7 7 7" />
                  </svg>
                </div>
                <div className="text-base sm:text-xl font-bold text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(totalExpenses)}</div>
                <div className="text-xs text-red-400 whitespace-nowrap">-3%</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-5 min-h-[80px] sm:min-h-[100px] min-w-0">
                <span className="text-xs sm:text-sm font-medium text-gray-300 block mb-2 sm:mb-3 whitespace-nowrap">Scheduled</span>
                <div className="text-base sm:text-xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(savingsGoal)}</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-xs text-gray-400">Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-xs text-gray-400">Expenses</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-xs text-gray-400">Scheduled</span>
              </div>
            </div>
            
            {/* Stacked Bar Chart */}
            <BudgetOverviewChart trend={trend} income={totalIncome} expenses={totalExpenses} scheduled={savingsGoal} period={budgetOverviewPeriod} />
          </div>
        </div>
        
        {/* Bottom Left - Spending Summary */}
        <div className="lg:col-span-6">
          <div className="bg-[#252525] rounded-xl p-4 sm:p-6 border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 min-w-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base sm:text-lg font-semibold text-white break-words" style={{ wordBreak: 'break-word' }}>Spending Summary</h3>
              </div>
            </div>
            
            {/* Full Circle Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <ExpensePieChart categories={summary?.categories || []} total={totalExpenses} />
              <div className="mt-6 text-center">
                <p className="text-sm uppercase text-gray-400 font-medium mb-2 tracking-wide whitespace-nowrap">Total Spent</p>
                <p className="text-2xl font-bold text-white whitespace-nowrap">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Right - Recent Transactions */}
        <div className="lg:col-span-6">
          <div className="bg-[#252525] rounded-xl border border-gray-800 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white break-words" style={{ wordBreak: 'break-word' }}>Recent Transactions</h3>
                <div className="flex space-x-2 flex-shrink-0">
                  <Link
                    to="/expenses"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    + Add
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {transactions.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.amount >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <span className={`text-lg ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {getCategoryIcon(tx.category)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{tx.description || tx.category}</div>
                            <div className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold whitespace-nowrap ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/expenses" className="block p-4 text-center text-blue-500 hover:text-blue-400 text-sm font-medium border-t border-gray-800">
                    See All Transactions →
                  </Link>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <p className="mb-4">No transactions found</p>
                  <Link
                    to="/upload-csv"
                    className="text-blue-500 hover:text-blue-400 font-medium"
                  >
                    Upload your first CSV
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

// Donut Chart Component
const DonutChart = ({ income, savings, expenses }) => {
  const total = income;
  const savingsPercent = (savings / total) * 100;
  const expensesPercent = (expenses / total) * 100;
  const leftPercent = 100 - savingsPercent - expensesPercent;

  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Background circle */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a2a" strokeWidth="12" />
        
        {/* Savings */}
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
        
        {/* Expenses */}
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
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-gray-400">Income</p>
        <p className="text-lg font-bold text-white">
          {LOCALE_CONFIG.currency.format(income)}
        </p>
      </div>
    </div>
  );
};

// Trend Chart Component
const TrendChart = ({ data }) => {
  const width = 600;
  const height = 250;
  const padding = 40;
  
  const values = data.map(d => Math.abs(d.total));
  const maxY = Math.max(...values, 1);
  const minY = 0;
  
  const scaleX = (i) => padding + (i * (width - 2 * padding)) / Math.max(1, data.length - 1);
  const scaleY = (v) => height - padding - ((v - minY) * (height - 2 * padding)) / (maxY - minY || 1);
  
  const points = data.map((d, i) => ({
    x: scaleX(i),
    y: scaleY(Math.abs(d.total))
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * (height - 2 * padding);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#2a2a2a"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Area gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area */}
        <path d={areaD} fill="url(#areaGradient)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="3" />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#7C3AED" />
        ))}
        
        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={scaleX(i)}
            y={height - padding + 20}
            fontSize="10"
            textAnchor="middle"
            fill="#9CA3AF"
          >
            {d.month}
          </text>
        ))}
      </svg>
    </div>
  );
};

// Budget Overview Chart Component - Stacked Bar Chart
const BudgetOverviewChart = ({ trend, income, expenses, scheduled, period = '6months' }) => {
  const chartHeight = 200;
  const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  
  // Helper function to format month label from YYYY-MM
  const getMonthLabel = (monthStr) => {
    if (!monthStr || !monthStr.includes('-')) return '';
    const monthNum = parseInt(monthStr.split('-')[1], 10);
    return monthNames[monthNum - 1] || '';
  };
  
  // Helper function to get month and year from YYYY-MM
  const parseMonth = (monthStr) => {
    if (!monthStr || !monthStr.includes('-')) return null;
    const [year, month] = monthStr.split('-').map(Number);
    return { year, month };
  };
  
  // Get current date info
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Process trend data based on period
  let displayData = [];
  
  // Get previous year for "Last Year" period
  const previousYear = currentYear - 1;
  
  // Validate data matches requested period
  if (trend && trend.length > 0) {
    // For "lastyear", filter to show only previous calendar year (e.g., 2024 if current is 2025)
    if (period === 'lastyear') {
      // Filter trend data to only include months from the previous calendar year
      const lastYearData = trend.filter(item => {
        const parsed = parseMonth(item.month);
        return parsed && parsed.year === previousYear;
      });
      
      // If we have less than 11 months from previous year, show empty chart
      if (lastYearData.length < 11) {
        // Not enough data for last year - show empty chart with all 12 month labels from previous year
        displayData = monthNames.map((label, index) => ({
          month: `${previousYear}-${String(index + 1).padStart(2, '0')}`,
          monthLabel: label,
          expenses: 0,
          income: 0,
          scheduled: 0,
          hasData: false
        }));
      } else {
        // We have enough data - map all 12 months, filling in empty ones if needed
        displayData = monthNames.map((label, index) => {
          const monthStr = `${previousYear}-${String(index + 1).padStart(2, '0')}`;
          const trendItem = lastYearData.find(item => item.month === monthStr);
          
          return {
            month: monthStr,
            monthLabel: label,
            expenses: trendItem ? Math.abs(trendItem.total || 0) : 0,
            income: trendItem ? income : 0,
            scheduled: trendItem ? scheduled : 0,
            hasData: !!trendItem
          };
        });
      }
    } else if (period === 'thisyear') {
      // Show January to current month of current year
      displayData = trend
        .filter(item => {
          const parsed = parseMonth(item.month);
          return parsed && parsed.year === currentYear && parsed.month <= currentMonth;
        })
        .map(item => ({
          month: item.month,
          monthLabel: getMonthLabel(item.month),
          expenses: Math.abs(item.total || 0),
          income: income, // Use same income for all months
          scheduled: scheduled, // Use same scheduled for all months
          hasData: true
        }));
      
      // If no data for some months, add empty entries for January to current month
      const existingMonths = new Set(
        displayData
          .map(d => {
            const parsed = parseMonth(d.month);
            return parsed ? parsed.month : null;
          })
          .filter(m => m !== null)
      );
      for (let m = 1; m <= currentMonth; m++) {
        if (!existingMonths.has(m)) {
          displayData.push({
            month: `${currentYear}-${String(m).padStart(2, '0')}`,
            monthLabel: monthNames[m - 1],
            expenses: 0,
            income: 0,
            scheduled: 0,
            hasData: false
          });
        }
      }
      
      // Sort by month
      displayData.sort((a, b) => {
        const aParsed = parseMonth(a.month);
        const bParsed = parseMonth(b.month);
        if (!aParsed || !bParsed) return 0;
        if (aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
        return aParsed.month - bParsed.month;
      });
    } else {
      // For "6 Months", use trend data directly (already sorted chronologically)
      // Note: "lastyear" is handled above in the if condition
      displayData = trend.map(item => ({
        month: item.month,
        monthLabel: getMonthLabel(item.month),
        expenses: Math.abs(item.total || 0),
        income: income,
        scheduled: scheduled,
        hasData: true
      }));
    }
  }
  
  // If no data, handle differently based on period
  if (displayData.length === 0) {
    if (period === 'lastyear') {
      // For "Last Year", show all 12 months from previous year with empty bars
      displayData = monthNames.map((label, index) => ({
        month: `${previousYear}-${String(index + 1).padStart(2, '0')}`,
        monthLabel: label,
        expenses: 0,
        income: 0,
        scheduled: 0,
        hasData: false
      }));
    } else {
      // For other periods, show placeholder for current month
      displayData = [{
        month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        monthLabel: monthNames[currentMonth - 1],
        expenses: expenses || 0,
        income: income || 0,
        scheduled: scheduled || 0,
        hasData: true
      }];
    }
  }
  
  // Calculate max value for scaling
  const valuesWithData = displayData
    .filter(d => d.hasData)
    .map(d => d.income + d.expenses + d.scheduled);
  
  // If no data and period is "lastyear", set a minimal maxValue to ensure chart renders empty
  const maxValue = valuesWithData.length > 0
    ? Math.max(...valuesWithData, income + expenses + scheduled, 1000)
    : (period === 'lastyear' && displayData.length === 0 ? 1000 : Math.max(income + expenses + scheduled, 1000));
  
  return (
    <div className="mt-2">
      <div className="flex items-end justify-between" style={{ height: `${chartHeight + 30}px` }}>
        {displayData.map((data, i) => {
          const incomeHeight = data.hasData ? ((data.income / maxValue) * chartHeight) : 0;
          const expensesHeight = data.hasData ? ((data.expenses / maxValue) * chartHeight) : 0;
          const scheduledHeight = data.hasData ? ((data.scheduled / maxValue) * chartHeight) : 0;
          
          return (
            <div key={`${i}-${data.month}`} className="flex flex-col items-center flex-1 mx-0.5">
              <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
                {data.hasData ? (
                  <div className="absolute bottom-0 w-full flex flex-col-reverse">
                    {incomeHeight > 0 && (
                      <div 
                        className="w-full rounded-t" 
                        style={{ 
                          height: `${Math.max(incomeHeight, 1)}px`, 
                          backgroundColor: '#3B82F6'
                        }}
                      ></div>
                    )}
                    {expensesHeight > 0 && (
                      <div 
                        className="w-full" 
                        style={{ 
                          height: `${Math.max(expensesHeight, 1)}px`, 
                          backgroundColor: '#60A5FA'
                        }}
                      ></div>
                    )}
                    {scheduledHeight > 0 && (
                      <div 
                        className="w-full rounded-t" 
                        style={{ 
                          height: `${Math.max(scheduledHeight, 1)}px`, 
                          backgroundColor: '#A78BFA'
                        }}
                      ></div>
                    )}
                  </div>
                ) : (
                  // Empty month - show subtle background bar
                  <div className="absolute bottom-0 w-full" style={{ height: '2px', backgroundColor: '#1a1a1a' }}></div>
                )}
              </div>
              <span className={`text-xs mt-2 block ${data.hasData ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.monthLabel || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get category breakdown with icons
const getCategoryBreakdown = (categories) => {
  const categoryIcons = {
    'Shopping': (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    'Utilities': (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'Food': (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'Groceries': (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    'Transportation': (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  };

  const defaultIcon = (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (!categories || categories.length === 0) {
    return [
      { category: 'Others', total: 0, icon: defaultIcon },
      { category: 'Others', total: 0, icon: defaultIcon },
      { category: 'Others', total: 0, icon: defaultIcon }
    ];
  }

  // Sort categories by total
  const sortedCategories = [...categories]
    .filter(cat => cat && cat.total > 0)
    .sort((a, b) => b.total - a.total);

  // Take top 2 categories (matching the design which shows Shopping, Utilities, Others)
  const topTwo = sortedCategories.slice(0, 2);
  
  // Calculate Others total (sum of all categories beyond top 2)
  const topTwoTotal = topTwo.reduce((sum, cat) => sum + cat.total, 0);
  const allCategoriesTotal = sortedCategories.reduce((sum, cat) => sum + cat.total, 0);
  const othersTotal = Math.max(0, allCategoriesTotal - topTwoTotal);

  // Map top 2 categories to include icons
  const mappedCategories = topTwo.map(cat => ({
    ...cat,
    icon: categoryIcons[cat.category] || defaultIcon
  }));

  // Always add "Others" as the third item
  mappedCategories.push({
    category: 'Others',
    total: othersTotal,
    icon: defaultIcon
  });

  // If we had fewer than 2 categories, pad with zeros to ensure we have exactly 3 items
  while (mappedCategories.length < 3) {
    mappedCategories.unshift({
      category: 'Others',
      total: 0,
      icon: defaultIcon
    });
  }

  return mappedCategories.slice(0, 3);
};

// Full Circle Pie Chart Component - Top 5 categories + Others (3D Styled)
const ExpensePieChart = ({ categories, total }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  // Vibrant gradient color palette for 6 segments - distinct colors for dark background
  const colorGradients = [
    { id: 'grad1', colors: ['#FF0080', '#FF4DA6', '#FF0066'] }, // Vibrant Magenta/Pink
    { id: 'grad2', colors: ['#00D4FF', '#4DE8FF', '#00B8E6'] }, // Bright Cyan/Blue
    { id: 'grad3', colors: ['#00FF88', '#4DFFA3', '#00E66B'] }, // Neon Green
    { id: 'grad4', colors: ['#FFD700', '#FFE44D', '#FFC700'] }, // Golden Yellow
    { id: 'grad5', colors: ['#9D50FF', '#B570FF', '#8B30FF'] }, // Purple/Violet
    { id: 'grad6', colors: ['#FF6B00', '#FF8C42', '#FF5500'] }, // Orange for Others
  ];
  
  // Process categories: get top 5 + Others
  const processCategories = () => {
    if (!categories || categories.length === 0) {
      return [{ category: 'No Data', total: total || 0, gradientId: colorGradients[5].id }];
    }
    
    // Sort by total descending
    const sorted = [...categories]
      .filter(cat => cat && cat.total > 0)
      .sort((a, b) => b.total - a.total);
    
    // Get top 5
    const top5 = sorted.slice(0, 5);
    
    // Calculate Others total
    const top5Total = top5.reduce((sum, cat) => sum + cat.total, 0);
    const allTotal = sorted.reduce((sum, cat) => sum + cat.total, 0);
    const othersTotal = Math.max(0, allTotal - top5Total);
    
    // Map top 5 with gradients
    const segments = top5.map((cat, index) => ({
      category: cat.category || 'Unknown',
      total: cat.total,
      gradientId: colorGradients[index].id,
      gradientColors: colorGradients[index].colors
    }));
    
    // Add Others if there's any remaining
    if (othersTotal > 0 || segments.length < 6) {
      segments.push({
        category: 'Others',
        total: othersTotal,
        gradientId: colorGradients[5].id,
        gradientColors: colorGradients[5].colors
      });
    }
    
    return segments;
  };
  
  const segments = processCategories();
  const totalAmount = segments.reduce((sum, seg) => sum + seg.total, 0) || total || 0;
  
  // Chart dimensions - larger for better visibility
  const size = 300;
  const radius = size / 2 - 15;
  const centerX = size / 2;
  const centerY = size / 2;
  const depth = 8; // 3D depth offset
  
  // Helper to convert angle to coordinates
  const getCoordinates = (angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };
  
  // Calculate pie segments with 3D shadow layer
  const calculatePaths = () => {
    let currentAngle = 0;
    
    return segments.map((segment, index) => {
      const percentage = totalAmount > 0 ? (segment.total / totalAmount) : 0;
      const angle = percentage * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const start = getCoordinates(startAngle);
      const end = getCoordinates(endAngle);
      
      // Midpoint for gradient direction
      const midAngle = (startAngle + endAngle) / 2;
      const mid = getCoordinates(midAngle);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = totalAmount > 0 && segment.total > 0
        ? `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
        : '';
      
      // Shadow layer path (shifted down and right for 3D effect)
      const shadowPath = totalAmount > 0 && segment.total > 0
        ? `M ${centerX + depth} ${centerY + depth} L ${start.x + depth} ${start.y + depth} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x + depth} ${end.y + depth} Z`
        : '';
      
      currentAngle = endAngle;
      
      return {
        ...segment,
        pathData,
        shadowPath,
        startAngle,
        endAngle,
        percentage,
        midPoint: mid
      };
    });
  };
  
  const paths = calculatePaths();
  
  // Handle mouse move for tooltip
  const handleMouseMove = (e, segment) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredSegment(segment);
  };
  
  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };
  
  const isHovered = (segment) => hoveredSegment === segment;
  
  return (
    <div ref={containerRef} className="relative flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px` }}>
      <svg width={size} height={size} className="transform -rotate-90" style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.4))' }}>
        <defs>
          {colorGradients.map((grad, index) => (
            <linearGradient key={grad.id} id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={grad.colors[0]} stopOpacity="1" />
              <stop offset="50%" stopColor={grad.colors[1]} stopOpacity="1" />
              <stop offset="100%" stopColor={grad.colors[2]} stopOpacity="1" />
            </linearGradient>
          ))}
          
          {/* Glossy highlight gradient */}
          <radialGradient id="gloss" cx="50%" cy="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          
          {/* Shadow filter for 3D effect */}
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Shadow layer (background) */}
        {paths.map((segment, index) => (
          segment.shadowPath ? (
            <g key={`shadow-${segment.category}-${index}`}>
              <path
                d={segment.shadowPath}
                fill="rgba(0,0,0,0.3)"
                opacity="0.4"
              />
            </g>
          ) : null
        ))}
        
        {/* Main pie segments */}
        {paths.map((segment, index) => (
          segment.pathData ? (
            <g key={`${segment.category}-${index}`}>
              <path
                d={segment.pathData}
                fill={`url(#${segment.gradientId})`}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
                strokeLinejoin="round"
                onMouseEnter={(e) => handleMouseMove(e, segment)}
                onMouseMove={(e) => handleMouseMove(e, segment)}
                onMouseLeave={handleMouseLeave}
                style={{
                  cursor: 'pointer',
                  transform: isHovered(segment) ? 'scale(1.05) translate(-2px, -2px)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s',
                  filter: isHovered(segment) 
                    ? 'brightness(1.2) drop-shadow(0 8px 16px rgba(0,0,0,0.5))' 
                    : 'brightness(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  opacity: hoveredSegment === null || isHovered(segment) ? 1 : 0.6,
                }}
              />
              {/* Glossy highlight overlay */}
              <path
                d={segment.pathData}
                fill="url(#gloss)"
                pointerEvents="none"
              />
            </g>
          ) : null
        ))}
      </svg>
      
      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="absolute bg-gradient-to-br from-gray-800 to-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-none z-20 border border-gray-700 whitespace-nowrap backdrop-blur-sm"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 60}px`,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.2s ease-out',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)'
          }}
        >
          <div className="font-bold text-base mb-1">{hoveredSegment.category}</div>
          <div className="text-yellow-300 font-semibold text-lg">{LOCALE_CONFIG.currency.format(hoveredSegment.total)}</div>
        </div>
      )}
    </div>
  );
};

export default NewDashboard;

