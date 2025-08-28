@echo off
echo 🚀 Starting Ballistics Calculator with Docker
echo ===============================================

cd /d "c:\Users\veter\Desktop\DEV\github\ballistic-calculator"

echo Choose mode:
echo 1. Production (default)
echo 2. Development (with hot reload)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="2" (
    echo 🔧 Starting in DEVELOPMENT mode...
    docker-compose -f docker-compose.dev.yml up --build
) else (
    echo 🚀 Starting in PRODUCTION mode...
    docker-compose up --build
)

echo.
echo ✅ Application started!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the application
pause
