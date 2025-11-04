# How to Start the Backend Server

## Quick Start

From the project root directory (`c:\Projects\FamFinity`), run:

```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```

Or use the batch file:

```powershell
cd backend
.\start_server.bat
```

## Alternative: Run from project root

From `c:\Projects\FamFinity`:

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

## Common Issues

1. **"Could not import module 'main'"** - Make sure you're in the `backend` directory, not `FamFinity\fin-genius\backend`

2. **Missing dependencies** - Install requirements:
   ```powershell
   pip install -r backend/requirements.txt
   ```

3. **Environment variables** - Make sure `.env` file exists in the `backend` directory with Supabase credentials

