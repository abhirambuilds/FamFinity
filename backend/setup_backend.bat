@echo off
echo ========================================
echo    FamFinity Backend Setup Script
echo    (Dependency Conflict Resolution)
echo ========================================
echo.

echo Step 1: Creating fresh virtual environment...
if exist venv rmdir /s /q venv
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo Step 3: Upgrading pip...
python -m pip install --upgrade pip

echo Step 4: Installing core dependencies first...
pip install fastapi==0.104.1 uvicorn==0.24.0 python-dotenv==1.0.0 supabase==2.3.0
pip install sqlalchemy==2.0.23 asyncpg==0.29.0 pydantic==2.9.2
pip install python-multipart==0.0.6 passlib[bcrypt]==1.7.4 python-jose[cryptography]==3.3.0

echo Step 5: Installing data processing libraries...
pip install "pandas>=1.5.0,<2.2.0" "numpy>=1.24.0,<2.0.0"

echo Step 6: Installing ML libraries (optional)...
pip install "torch>=1.13.0,<2.8.0" "torchvision>=0.14.0,<0.23.0" "scikit-learn>=1.2.0,<1.4.0"
pip install "matplotlib>=3.6.0,<3.9.0" "joblib>=1.2.0,<1.4.0"

echo Step 7: Installing remaining dependencies...
pip install alembic==1.13.1 pytest==7.4.3 pytest-asyncio==0.21.1

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create .env file with your Supabase credentials
echo 2. Run: python main.py
echo.
echo If you encounter issues, try the minimal version:
echo pip install -r requirements-minimal.txt
echo.
echo Press any key to continue...
pause > nul

