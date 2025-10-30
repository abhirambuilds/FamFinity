@echo off
echo Starting FamFinity Backend Server...
echo.
echo Make sure you have:
echo 1. Set up your .env file with Supabase credentials
echo 2. Installed dependencies: pip install -r requirements.txt
echo.
echo Backend will start on http://localhost:8000
echo Press CTRL+C to stop the server
echo.
pause
python -m uvicorn main:app --reload --port 8000

