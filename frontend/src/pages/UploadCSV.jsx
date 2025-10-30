import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, authAPI, handleAPIError } from '../api';

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');
  };

  // Simple CSV parser
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredColumns = ['date', 'amount', 'category'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const transactions = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Validate and parse
        if (!row.date) {
          errors.push(`Row ${i + 1}: Date cannot be empty`);
          continue;
        }

        if (!row.amount || isNaN(parseFloat(row.amount))) {
          errors.push(`Row ${i + 1}: Invalid amount`);
          continue;
        }

        const amount = parseFloat(row.amount);
        if (amount === 0) {
          errors.push(`Row ${i + 1}: Amount cannot be zero`);
          continue;
        }

        if (!row.category || !row.category.trim()) {
          errors.push(`Row ${i + 1}: Category cannot be empty`);
          continue;
        }

        // Extract metadata (any additional columns)
        const metadata = {};
        headers.forEach(header => {
          if (!requiredColumns.includes(header) && row[header]) {
            metadata[header] = row[header];
          }
        });

        transactions.push({
          date: row.date,
          amount: amount,
          category: row.category.trim(),
          metadata: metadata
        });
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in CSV');
    }

    return { transactions, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if this is a new user flow (has pending signup data)
      const pendingSignup = localStorage.getItem('pending_signup');
      const pendingQuestions = localStorage.getItem('pending_questions');
      const userId = localStorage.getItem('userId');

      if (pendingSignup && pendingQuestions) {
        // New user flow - parse CSV and create account with all data
        const fileContent = await file.text();
        const { transactions, errors: parseErrors } = parseCSV(fileContent);

        if (parseErrors.length > 0) {
          setError(`CSV parsing errors: ${parseErrors.join(', ')}`);
          setLoading(false);
          return;
        }

        const signupData = JSON.parse(pendingSignup);
        const questions = JSON.parse(pendingQuestions);

        // Call complete signup endpoint
        const response = await authAPI.completeSignup({
          email: signupData.email,
          password: signupData.password,
          full_name: signupData.full_name,
          questions: questions,
          transactions: transactions
        });

        if (response.success) {
          // Clear temporary data
          localStorage.removeItem('pending_signup');
          localStorage.removeItem('pending_questions');
          
          // Set auth tokens
          localStorage.setItem('userId', response.user_id);
          localStorage.setItem('access_token', response.access_token);

          setSuccess(`Account created successfully! Imported ${transactions.length} transactions.`);
          
          // Mark that CSV was uploaded so dashboard can refresh
          sessionStorage.setItem('csv_uploaded', 'true');
          
          // Show success toast for 3 seconds then redirect
          setTimeout(() => {
            navigate('/dashboard', { state: { refresh: true } });
          }, 3000);
        }
      } else if (userId) {
        // Existing user flow - just upload CSV
        const response = await uploadAPI.uploadCSV(file);
        
        if (response.success) {
          setSuccess(`Successfully imported ${response.transactions_imported} transactions!`);
          
          // Mark that CSV was uploaded so dashboard can refresh
          sessionStorage.setItem('csv_uploaded', 'true');
          
          // Show success toast for 3 seconds then redirect
          setTimeout(() => {
            navigate('/dashboard', { state: { refresh: true } });
          }, 3000);
        }
      } else {
        // No signup data and no user ID - user needs to sign up first
        setError('Please sign up and answer questions first');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      }
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#120b25' }}>
      <div className="max-w-2xl mx-auto">
        <div className="shadow rounded-lg" style={{ backgroundColor: '#221e2f' }}>
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>Upload Transaction Data</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3" style={{ color: 'white' }}>CSV Format Requirements</h2>
              <div className="p-4 rounded-md" style={{ backgroundColor: '#120b25' }}>
                <p className="text-sm mb-2" style={{ color: '#c4c4c4' }}>
                  Your CSV file must contain the following columns:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1" style={{ color: '#c4c4c4' }}>
                  <li><strong style={{ color: 'white' }}>date</strong> - Transaction date (YYYY-MM-DD format)</li>
                  <li><strong style={{ color: 'white' }}>amount</strong> - Transaction amount (positive or negative)</li>
                  <li><strong style={{ color: 'white' }}>category</strong> - Transaction category (e.g., "Food", "Transportation")</li>
                </ul>
                <p className="text-sm mt-2" style={{ color: '#c4c4c4' }}>
                  Additional columns will be stored as metadata.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium mb-2" style={{ color: '#c4c4c4' }}>
                  Select CSV File
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm"
                  style={{ color: '#c4c4c4' }}
                />
                {file && (
                  <p className="mt-2 text-sm" style={{ color: '#c4c4c4' }}>
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Sample CSV format */}
              <div className="p-4 rounded-md" style={{ backgroundColor: '#120b25' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: '#6246e9' }}>Sample CSV Format:</h3>
                <pre className="text-xs p-2 rounded border" style={{ backgroundColor: '#221e2f', color: '#c4c4c4', borderColor: '#221e2f' }}>
{`date,amount,category,description
2024-01-15,-25.50,Food,Grocery shopping
2024-01-16,-12.00,Transportation,Uber ride
2024-01-17,1500.00,Income,Salary`}
                </pre>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-md p-4" style={{ backgroundColor: '#3f1f1f', border: '1px solid #5f1f1f' }}>
                  <div className="text-sm" style={{ color: '#ff6b6b' }}>{error}</div>
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="rounded-md p-4" style={{ backgroundColor: '#1f3f2f', border: '1px solid #2f5f3f' }}>
                  <div className="text-sm" style={{ color: '#6bff6b' }}>{success}</div>
                  <div className="text-xs mt-1" style={{ color: '#8bff8b' }}>
                    Redirecting to dashboard in 3 seconds...
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border rounded-md text-sm font-medium transition-all"
                  style={{ 
                    borderColor: '#221e2f', 
                    color: '#c4c4c4', 
                    backgroundColor: '#120b25'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ backgroundColor: '#6246e9' }}
                >
                  {loading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;
