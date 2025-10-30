# FamFinity - Complete Setup Guide

## 🇮🇳 Indian Finance Management Platform

FamFinity is a comprehensive financial management application designed specifically for Indian users, featuring:
- Dark purple themed UI matching modern Indian fintech apps
- Indian Rupee (₹) formatting throughout
- AI-powered financial advice (local + Gemini)
- Complete budget planning and expense tracking
- Investment recommendations based on risk levels
- Goal setting with AI suggestions

---

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
- Supabase account (free tier works)
- Google Gemini API key (optional, for chatbot)

---

## 🚀 Quick Start

### 1. Database Setup

#### Option A: Using Supabase (Recommended)

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the migrations:
   - Run `backend/db/legacy_migrations/001_init.sql`
   - Run `backend/db/002_add_budgets_expenses.sql`
3. Note your project URL and service role key

#### Option B: Local PostgreSQL

1. Install PostgreSQL
2. Create database: `createdb famfinity`
3. Run migrations:
   ```bash
   psql famfinity < backend/db/legacy_migrations/001_init.sql
   psql famfinity < backend/db/002_add_budgets_expenses.sql
   ```

### 2. Backend Setup

```bash
cd fin-genius/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../env.example .env

# Edit .env with your credentials:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# SUPABASE_ANON_KEY=your_anon_key
# GEMINI_API_KEY=your_gemini_key (optional)

# Run the server
python main.py
# Or use: uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd fin-genius/frontend

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🎨 Features Overview

### 1. Dashboard
- **Net worth overview** with Indian Rupee formatting
- **Monthly budget visualization** with donut charts
- **Expense trend charts** for last 6 months
- **Category breakdown** with progress bars
- **Recent transactions table** with all CSV data

### 2. Budgets
- **3-step wizard**: Income → Savings → Expenses
- **Category-wise budgeting** (Bills, Housing, Food, etc.)
- **Real-time budget preview** with donut chart
- **Monthly budget tracking**

### 3. Expenses
- **Add expenses** by day/month/item
- **Filter by month**
- **Categorize expenses** automatically
- **Delete and manage** individual expenses
- **All expenses update dashboard** in real-time

### 4. Goals
- **Set financial goals** with target amount and date
- **AI-powered suggestions** based on your income
- **Predicted time** to achieve goals
- **Track multiple goals** simultaneously

### 5. AI Finance Advisor
- **Personalized advice** based on YOUR financial data
- Uses your transactions, budgets, and onboarding answers
- **Offline AI models** for privacy
- Get spending insights and recommendations

### 6. AI Chatbot
- **General finance knowledge** powered by Google Gemini
- Ask about investment concepts, tax savings, etc.
- **Real-world information** and explanations
- No access to your personal data (privacy-focused)

### 7. Investment Plans
- **Risk assessment** (Level 1-5: No risk to High risk)
- **Indian investment options**: FD, PPF, Mutual Funds, Stocks, etc.
- **Time-based recommendations**: Short/Medium/Long term
- Personalized based on your investment amount

### 8. Profile
- **Edit profile information**
- **View account details**
- **Logout functionality**

---

## 📊 Data Flow

### CSV Upload Flow:
1. User uploads CSV file → `/upload/upload-csv`
2. Backend validates and parses CSV
3. Data stored in `transactions` table in Supabase
4. Dashboard automatically fetches and displays in ₹

### Budget Flow:
1. User creates budget → `/budgets/create`
2. Data stored in `budgets` table
3. Dashboard compares actual vs budgeted expenses
4. Visual donut chart shows allocation

### Expense Flow:
1. User adds manual expense → `/expenses/add`
2. Stored in `manual_expenses` table
3. Dashboard aggregates both CSV + manual expenses
4. All displayed in Indian Rupees

---

## 🔐 Authentication

The app uses Supabase Auth with JWT tokens:
- Sign up creates user in Supabase Auth
- All API calls include `Authorization: Bearer <token>`
- Protected routes redirect to signin if not authenticated

---

## 🗄️ Database Tables

### Core Tables:
- `users` - User accounts (Supabase Auth)
- `user_questions` - Onboarding answers
- `transactions` - CSV uploaded transactions
- `manual_expenses` - Manually added expenses
- `budgets` - Monthly budgets
- `goals` - Financial goals
- `investment_plans` - Investment recommendations
- `chats` - Chat history

---

## 🎯 Important Configuration

### Indian Localization (`frontend/src/config/locale.js`):
- Currency: INR (₹)
- Date format: DD/MM/YYYY
- Number format: Indian numbering (Lakhs, Crores)
- Expense categories customized for India

### Theme Colors:
- Primary: Purple (#7C3AED - Tailwind purple-600)
- Sidebar: Dark Purple Gradient (#1A0B47 to #2D1B69)
- Accent: Blue (#3B82F6)

---

## 🧪 Testing the App

### 1. Create an Account
```
Navigate to /signup
- Email: test@example.com
- Password: test123
- Name: Test User
```

### 2. Complete Onboarding
```
Answer 15 financial questions
This personalizes your AI Finance Advisor
```

### 3. Upload Sample CSV
```
Use: data/sample_user.csv
Format:
date,amount,category,description
2024-01-15,-500,Food,Groceries
2024-01-16,50000,Income,Salary
```

### 4. Create a Budget
```
Dashboard → Budgets → Create Budget
- Set income: ₹50,000
- Savings goal: ₹10,000
- Allocate categories
```

### 5. Add Manual Expenses
```
Expenses → Add Expense
- Date, amount, category
- Choose daily/monthly/one-time
```

### 6. Set a Goal
```
Goals → Add Goal
- Title: "New Laptop"
- Amount: ₹80,000
- Get AI suggestions
```

### 7. Try AI Features
```
AI Finance Advisor → Ask: "How can I save more?"
AI Chatbot → Ask: "What is a mutual fund?"
```

### 8. Get Investment Recommendations
```
Investments → Enter amount
- AI determines your risk level
- Shows Indian investment options by timeframe
```

---

## 🐛 Troubleshooting

### Backend Issues:

**Error: Missing environment variables**
```bash
# Make sure .env has:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_ANON_KEY=eyJxxx...
```

**Error: Database connection failed**
```bash
# Check Supabase project is running
# Verify credentials are correct
# Run migrations if tables don't exist
```

### Frontend Issues:

**Error: Network Error**
```bash
# Check backend is running on port 8000
# Verify CORS is enabled in main.py
# Check API_URL in api/index.js
```

**Pages not loading**
```bash
# Clear localStorage
# Check browser console for errors
# Verify all routes in App.jsx
```

---

## 📱 Mobile Responsiveness

The app is fully responsive:
- Sidebar collapses on mobile
- Tables scroll horizontally
- Charts adapt to screen size
- Touch-friendly buttons

---

## 🔒 Security Notes

1. **Never commit `.env` files** - they contain sensitive keys
2. **Use Supabase RLS** - Row Level Security policies are in `db/supabase_policies.sql`
3. **HTTPS in production** - Always use HTTPS for production deployments
4. **JWT tokens** - Stored in localStorage, automatically sent with requests

---

## 📈 Production Deployment

### Backend (Railway/Render/Heroku):
```bash
# Set environment variables
# Deploy from backend/ directory
# Entry point: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify):
```bash
# Build: npm run build
# Output: dist/
# Set VITE_API_URL to your backend URL
```

---

## 🤝 Contributing

This is a comprehensive finance app. Future enhancements:
- Bill reminders
- Receipt scanning with OCR
- Family account sharing
- Bank integration (UPI, IMPS)
- Tax calculation for India
- Multi-language support (Hindi, etc.)

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🙏 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Ensure all migrations are run
- Verify environment variables

---

**Made with ❤️ for Indian users by FamFinity team**

