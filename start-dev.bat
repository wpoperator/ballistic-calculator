@echo off
REM Ballistics Calculator Development Startup Script for Windows

echo 🚀 Starting Ballistics Calculator Development Environment
echo =======================================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the ballistic-calculator root directory
    exit /b 1
)

echo 📦 Installing dependencies...

REM Backend setup
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements-dev.txt
    cd ..
) else (
    echo ✅ Backend virtual environment already exists
)

REM Frontend setup  
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
) else (
    echo ✅ Frontend dependencies already installed
)

echo 🔧 Starting development servers...

REM Start backend in new window
echo Starting backend server on http://localhost:8000
start "Backend Server" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo Starting frontend server on http://localhost:3000
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo 🎉 Development servers started!
echo =================================
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Servers are running in separate windows. Close the windows to stop the servers.

pause
