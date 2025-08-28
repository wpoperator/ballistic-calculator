#!/bin/bash

# Ballistics Calculator Development Startup Script

echo "🚀 Starting Ballistics Calculator Development Environment"
echo "======================================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the ballistic-calculator root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Backend setup
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements-dev.txt
    cd ..
else
    echo "✅ Backend virtual environment already exists"
fi

# Frontend setup  
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

echo "🔧 Starting development servers..."

# Start backend in background
echo "Starting backend server on http://localhost:8000"
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on http://localhost:3000"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Development servers started!"
echo "================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "To stop the servers, press Ctrl+C"

# Trap to kill background processes when script is interrupted
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for user interrupt
wait
