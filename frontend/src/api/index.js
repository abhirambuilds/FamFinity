import axios from 'axios';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're NOT already on public/auth pages
      // This prevents clearing error messages when login fails
      const currentPath = window.location.pathname;
      const publicPaths = ['/signin', '/signup', '/onboarding', '/upload-csv'];
      if (!publicPaths.includes(currentPath)) {
        // Clear token and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('userId');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  signin: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  completeSignup: async (signupData) => {
    const response = await api.post('/auth/complete-signup', signupData);
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  submitQuestions: async (answers) => {
    const response = await api.post('/questions/submit', {
      answers: answers
    });
    return response.data;
  },

  getUserQuestions: async () => {
    const response = await api.get('/questions/');
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserTransactions: async (limit = 100, offset = 0) => {
    const response = await api.get('/upload/transactions', {
      params: { limit, offset }
    });
    return response.data;
  },
};

// Finance API
export const financeAPI = {
  getSummary: async ({ month }) => {
    const response = await api.get('/finance/summary', {
      params: { month }
    });
    return response.data;
  },
  getTrend: async ({ months = 3 } = {}) => {
    const response = await api.get('/finance/trend', {
      params: { months }
    });
    return response.data;
  }
};

// Budgets API
export const budgetsAPI = {
  createBudget: async (budgetData) => {
    const response = await api.post('/budgets/create', budgetData);
    return response.data;
  },
  getCurrentBudget: async (month) => {
    const response = await api.get('/budgets/current', {
      params: { month }
    });
    return response.data;
  }
};

// Expenses API
export const expensesAPI = {
  addExpense: async (expenseData) => {
    const response = await api.post('/expenses/add', expenseData);
    return response.data;
  },
  getExpenses: async (month, limit = 100, offset = 0) => {
    const response = await api.get('/expenses/list', {
      params: { month, limit, offset }
    });
    return response.data;
  },
  getSummary: async (month) => {
    const response = await api.get('/expenses/summary', {
      params: { month }
    });
    return response.data;
  },
  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  }
};

// Goals API
export const goalsAPI = {
  createGoal: async (goalData) => {
    const response = await api.post('/goals/create', goalData);
    return response.data;
  },
  getGoals: async () => {
    const response = await api.get('/goals/list');
    return response.data;
  },
  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  }
};

// Investments API
export const investmentsAPI = {
  getRecommendations: async (amount) => {
    const response = await api.post('/investments/recommend', { amount });
    return response.data;
  },
  getAllPlans: async () => {
    const response = await api.get('/investments/all-plans');
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const detail = error.response.data.detail;
    let message = 'An error occurred';
    
    // Handle FastAPI validation errors (422 status)
    if (Array.isArray(detail)) {
      // Extract error messages from validation errors
      message = detail.map(err => {
        const field = err.loc ? err.loc.join('.') : 'field';
        return `${field}: ${err.msg}`;
      }).join(', ');
    } else if (typeof detail === 'string') {
      message = detail;
    } else if (detail && detail.msg) {
      // Single error object
      message = detail.msg;
    }
    
    return {
      message,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

export default api;
