# How to Start the Backend Server

## Issue: "Network error - please check your connection"

This error occurs when the frontend tries to connect to the backend API at `http://localhost:8000`, but the backend server is not running.

## Solution: Start the Backend Server

### Option 1: Command Line (Recommended)

Open a **new terminal window** and run:

```bash
cd D:\Project\FamFinity\fin-genius\backend
uvicorn main:app --reload --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Option 2: Using the Development Script

```bash
cd D:\Project\FamFinity\fin-genius
./scripts/start-dev.sh
```

### Option 3: Using Python directly

```bash
cd D:\Project\FamFinity\fin-genius\backend
python -m uvicorn main:app --reload --port 8000
```

## Verify the Backend is Running

Open your browser or use curl to test:
```
http://localhost:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "message": "Famfinity API is running"
}
```

## Common Issues

### 1. Port Already in Use
If port 8000 is already in use, try a different port:
```bash
uvicorn main:app --reload --port 8001
```

Then update the frontend `.env` file:
```
VITE_API_URL=http://localhost:8001
```

### 2. Dependencies Missing
If you get import errors, install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables Not Set
Ensure `.env` file exists in the root with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_secret_key
```

## Frontend Configuration

The frontend is configured to connect to `http://localhost:8000` by default.

If you need to change this, create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

## Once Backend is Running

1. Open frontend in browser: `http://localhost:5173` (or your Vite dev server port)
2. Click "Get Started" 
3. Fill in the signup form
4. Submit - should work now!

## Development Workflow

**Terminal 1 - Backend:**
```bash
cd D:\Project\FamFinity\fin-genius\backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd D:\Project\FamFinity\fin-genius\frontend
npm run dev
```

Both servers should be running for the app to work properly.

