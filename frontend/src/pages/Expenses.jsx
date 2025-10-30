import React, { useState, useEffect } from 'react';
import { expensesAPI, authAPI, handleAPIError, uploadAPI } from '../api';
import AppLayout from '../components/AppLayout';
import LOCALE_CONFIG from '../config/locale';

const Expenses = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: LOCALE_CONFIG.expenseCategories[0]?.name || 'Other',
    description: '',
    expense_type: 'one-time'
  });
  
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploadError, setCsvUploadError] = useState('');
  const [csvUploadSuccess, setCsvUploadSuccess] = useState('');

  useEffect(() => {
    loadUser();
    loadExpenses();
  }, [month]);

  const loadUser = async () => {
    try {
      const resp = await authAPI.getCurrentUser();
      setUser(resp);
    } catch (err) {
      console.error('Failed to load user');
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      
      // Load both manual expenses and CSV transactions in parallel
      const [manualExpensesResp, csvTransactionsResp] = await Promise.all([
        expensesAPI.getExpenses(month, 1000, 0).catch(() => ({ expenses: [] })),
        uploadAPI.getUserTransactions(1000, 0).catch(() => ({ transactions: [] }))
      ]);
      
      // Get manual expenses for the selected month
      const manualExpenses = (manualExpensesResp.expenses || []).map(exp => ({
        id: exp.id,
        date: exp.date,
        amount: Math.abs(exp.amount),
        category: exp.category,
        description: exp.description || exp.category,
        source: 'manual',
        expense_type: exp.expense_type || 'one-time'
      }));
      
      // Filter CSV transactions by month and only include expenses (negative amounts)
      const [year, monthNum] = month.split('-');
      const csvTransactions = (csvTransactionsResp.transactions || [])
        .filter(tx => {
          if (!tx.date) return false;
          const txDate = new Date(tx.date);
          const txYear = txDate.getFullYear();
          const txMonth = (txDate.getMonth() + 1).toString().padStart(2, '0');
          return txYear === parseInt(year) && txMonth === monthNum;
        })
        .filter(tx => (tx.amount || 0) < 0) // Only expenses (negative amounts)
        .map(tx => ({
          id: tx.id || `csv-${tx.date}-${tx.amount}`,
          date: tx.date,
          amount: Math.abs(tx.amount || 0),
          category: tx.category || 'Other',
          description: tx.metadata?.description || tx.category || 'Transaction',
          source: 'csv',
          expense_type: 'one-time'
        }));
      
      // Combine and sort by date (newest first)
      const allExpenses = [...manualExpenses, ...csvTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setExpenses(allExpenses);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
      }
      
      // Validate date
      if (!formData.date) {
        alert('Please select a date');
        return;
      }
      
      const result = await expensesAPI.addExpense({
        date: formData.date,
        amount: amount,
        category: formData.category,
        description: formData.description || null,
        expense_type: formData.expense_type
      });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        category: LOCALE_CONFIG.expenseCategories[0]?.name || 'Other',
        description: '',
        expense_type: 'one-time'
      });
      setShowAddForm(false);
      
      // Reload expenses to show the new one
      await loadExpenses();
      
      // Show success message
      alert('Expense added successfully!');
    } catch (err) {
      console.error('Error adding expense:', err);
      const errorInfo = handleAPIError(err);
      alert(`Failed to add expense: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;
    
    try {
      await expensesAPI.deleteExpense(expenseId);
      loadExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };
  
  const handleCSVUpload = async (e) => {
    e.preventDefault();
    
    if (!csvFile) {
      setCsvUploadError('Please select a CSV file');
      return;
    }
    
    setLoading(true);
    setCsvUploadError('');
    setCsvUploadSuccess('');
    
    try {
      const response = await uploadAPI.uploadCSV(csvFile);
      
      if (response.success) {
        setCsvUploadSuccess(`Successfully imported ${response.transactions_imported} transactions!`);
        setCsvFile(null);
        
        // Reload expenses after a short delay
        setTimeout(() => {
          loadExpenses();
          setShowCSVUpload(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      const errorInfo = handleAPIError(err);
      setCsvUploadError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => LOCALE_CONFIG.currency.format(amount);

  const categories = LOCALE_CONFIG.expenseCategories.map(c => c.name);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
            <p className="text-gray-500">Track your daily, monthly, and one-time expenses</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCSVUpload(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* Month Filter and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
            <p className="text-sm font-medium text-purple-700 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-1">Manual Expenses</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(expenses.filter(e => e.source === 'manual').reduce((sum, exp) => sum + exp.amount, 0))}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {expenses.filter(e => e.source === 'manual').length} manual
            </p>
          </div>
        </div>

        {/* CSV Upload Modal */}
        {showCSVUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload CSV File</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>date</strong> - Transaction date (YYYY-MM-DD format)</li>
                  <li><strong>amount</strong> - Transaction amount (positive or negative)</li>
                  <li><strong>category</strong> - Transaction category</li>
                </ul>
              </div>
              
              <form onSubmit={handleCSVUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      setCsvFile(e.target.files[0]);
                      setCsvUploadError('');
                      setCsvUploadSuccess('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                  {csvFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
                
                {csvUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {csvUploadError}
                  </div>
                )}
                
                {csvUploadSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    {csvUploadSuccess}
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCSVUpload(false);
                      setCsvFile(null);
                      setCsvUploadError('');
                      setCsvUploadSuccess('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !csvFile}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
                  <select
                    value={formData.expense_type}
                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Optional description..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && expenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading expenses...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{expense.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.description || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          expense.source === 'manual' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {expense.source === 'manual' ? 'Manual' : 'CSV'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {expense.expense_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600 text-right">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expense.source === 'manual' ? (
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {expenses.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-500">
                  <p>No expenses found for this month</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Add your first expense
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;

