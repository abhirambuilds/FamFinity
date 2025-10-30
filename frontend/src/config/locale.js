/**
 * Locale Configuration
 * 
 * Central configuration for Indian localization
 */

export const LOCALE_CONFIG = {
  country: 'India',
  currency: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee',
    format: (amount) => {
      // Indian number format with commas (e.g., ₹1,00,000)
      const formatted = amount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
      return `₹${formatted}`;
    }
  },
  numberFormat: {
    // Indian number system (lakhs, crores)
    toLakhs: (amount) => (amount / 100000).toFixed(2),
    toCrores: (amount) => (amount / 10000000).toFixed(2),
    formatLarge: (amount) => {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
      } else {
        return `₹${amount.toLocaleString('en-IN')}`;
      }
    }
  },
  dateFormat: 'DD/MM/YYYY', // Indian date format
  
  // Common Indian financial terms
  terms: {
    savings: 'Savings',
    investment: 'Investment',
    loan: 'Loan/EMI',
    fd: 'Fixed Deposit',
    rd: 'Recurring Deposit',
    ppf: 'Public Provident Fund',
    nps: 'National Pension System',
    sip: 'Systematic Investment Plan',
    mutualFund: 'Mutual Fund',
    stocks: 'Stocks/Shares',
    property: 'Property/Real Estate',
    gold: 'Gold',
    insurance: 'Insurance',
    tax: 'Tax/IT Returns'
  },
  
  // Indian expense categories
  expenseCategories: [
    { id: 'groceries', name: 'Groceries & Food', icon: '🛒' },
    { id: 'rent', name: 'Rent/EMI', icon: '🏠' },
    { id: 'utilities', name: 'Electricity & Bills', icon: '⚡' },
    { id: 'transport', name: 'Transport/Petrol', icon: '🚗' },
    { id: 'dining', name: 'Dining Out/Zomato', icon: '🍽️' },
    { id: 'entertainment', name: 'Entertainment/OTT', icon: '🎬' },
    { id: 'shopping', name: 'Shopping/Online', icon: '🛍️' },
    { id: 'education', name: 'Education/Tuition', icon: '📚' },
    { id: 'healthcare', name: 'Medical/Healthcare', icon: '🏥' },
    { id: 'insurance', name: 'Insurance Premium', icon: '🛡️' },
    { id: 'investments', name: 'SIP/Investments', icon: '📈' },
    { id: 'mobile', name: 'Mobile/Internet', icon: '📱' },
    { id: 'domestic', name: 'Domestic Help', icon: '👨‍🍳' },
    { id: 'personal', name: 'Personal Care', icon: '💇' },
    { id: 'other', name: 'Other', icon: '📝' }
  ]
};

export default LOCALE_CONFIG;

