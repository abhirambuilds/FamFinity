# FamFinity

A comprehensive financial intelligence application built with FastAPI backend and React frontend, designed specifically for Indian users with AI-powered financial advice and budgeting tools.

## 🚀 Features

- **AI-Powered Financial Advisor** - Get personalized financial recommendations
- **Smart Budgeting** - Create and manage budgets with intelligent insights
- **Expense Tracking** - Upload CSV files or manually track expenses
- **Goal Setting** - Set and track financial goals with progress monitoring
- **Investment Recommendations** - AI-driven investment suggestions
- **Interactive Chatbot** - Get instant answers to financial questions
- **Indian Currency Support** - Full support for ₹ (INR) transactions

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - Database and authentication
- **PyTorch** - Machine learning models
- **Scikit-learn** - Data analysis and predictions

### Frontend
- **React** - User interface library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- Supabase account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GEMINI_API_KEY=your_gemini_key  # Optional
   ```

5. **Run database migrations**
   ```bash
   # Run SQL files in Supabase SQL Editor:
   # 1. backend/db/legacy_migrations/001_init.sql
   # 2. backend/db/002_add_budgets_expenses.sql
   ```

6. **Start the server**
   ```bash
   python main.py
   # Or use: uvicorn main:app --reload
   ```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

### Gemini AI Configuration

The application uses Google's Gemini API for AI-powered features. To configure:

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key

2. **Set Environment Variables**
   - `GEMINI_API_KEY` (required): Your Gemini API key
   - `GEMINI_MODEL` (optional): Model name to use (default: `models/gemini-2.5-flash`)

3. **Debug Available Models**
   - Use the debug endpoint to see which models are available:
     ```bash
     GET https://your-backend-url/ai/models
     ```
   - This will return a list of available models for your API key
   - Copy the exact model name (e.g., `models/gemini-2.5-flash`) and set it in `GEMINI_MODEL`

4. **REST Endpoint**
   - The API uses: `v1/{model}:generateContent`
   - Always include the `models/` prefix in the model name

**Note**: The old `models/gemini-pro` and `models/gemini-1.5-flash` models have been retired. Use `models/gemini-2.5-flash` or check `/ai/models` for available options.

### Frontend Static Assets

PWA files (manifest, icons, logo) live in `frontend/public` and are automatically copied to the `dist` root by Vite during the build process. This includes:

- `manifest.json` - PWA manifest configuration
- `logo-mark.svg` - Application logo (SVG format)
- `favicon.png` - Favicon for browsers (256x256 PNG)
- `sw.js` - Service worker (currently disabled; cleanup script removes stale SWs)

**Note**: There is a one-time service worker cleanup script (`src/sw-cleanup.js`) that runs in production builds to unregister any existing service workers and clear caches. This prevents stale asset 404s after deployment. The cleanup runs automatically on first load and triggers a single reload to ensure fresh assets are loaded.

## 🎯 Quick Start

1. **Access the application**: http://localhost:5173
2. **Sign up** with your email and password
3. **Complete onboarding** by answering 15 financial questions
4. **Upload sample data**: Use `data/sample_user.csv`
5. **Create your first budget** and start tracking expenses

## 📊 Demo Account

For testing purposes, use these credentials:
- **Email**: demo.user@example.com
- **Password**: demo123

## 🔧 API Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User authentication
- `GET /health` - Health check
- `POST /upload/csv` - Upload transaction data
- `GET /advisor/recommendations` - Get AI recommendations
- `POST /chat/send` - Send message to AI chatbot

## 📁 Project Structure

```
.
├── backend/
│   ├── routes/          # API endpoints
│   ├── models/          # ML models and training
│   ├── services/        # Business logic
│   ├── db/             # Database migrations
│   └── scripts/        # Utility scripts
├── frontend/
│   ├── src/
│   │   ├── pages/      # React components
│   │   ├── components/ # Reusable components
│   │   └── api/        # API client
│   └── public/         # Static assets
└── data/               # Sample data files
```

## 🚀 Deployment

This project can be deployed to production using:
- **Backend**: [Render](https://render.com) (configured via `render.yaml`)
- **Frontend**: [Vercel](https://vercel.com) (configured via `vercel.json`)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Frontend Deployment (Vercel)

**Note**: This project uses Vercel's standard `@vercel/static-build` builder, **not** Build Output v3. The `vercel.json` configuration automatically publishes the Vite `dist` directory output. We do not use `.vercel/output/static` or custom Build Output v3 paths.

### Quick Deployment Steps

1. **Backend (Render)**:
   - Connect GitHub repository to Render
   - Render will auto-detect `render.yaml`
   - Set environment variables in Render dashboard
   - Deploy

2. **Frontend (Vercel)**:
   - Connect GitHub repository to Vercel
   - Root directory: leave empty (repo root)
   - Framework preset: Other
   - Build/Output/Install commands: leave empty (handled by `vercel.json`)
   - Set `VITE_API_URL` environment variable to your Render backend URL
   - Deploy

3. **Update CORS**:
   - After frontend deployment, update `FRONTEND_URL` in Render with your Vercel URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Indian financial community
- Powered by AI and modern web technologies
- Designed for simplicity and user-friendly experience
