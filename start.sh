#!/bin/bash

# AJAT Startup Script
echo "🚀 Starting AJAT - AI Job Application Tracker"
echo "=============================================="

# Check if virtual environment exists
if [ ! -d "backend/.venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   cd backend && python -m venv .venv"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Node modules not found. Please run setup first:"
    echo "   cd frontend && npm install"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
check_port 8000 || echo "   Backend port 8000 is busy"
check_port 5173 || echo "   Frontend port 5173 is busy"

# Start backend
echo "🔧 Starting backend server..."
cd backend
source .venv/bin/activate

# Initialize database if needed
if [ "$1" = "--init-db" ]; then
    echo "📊 Initializing database..."
    python scripts/init_db.py
fi

# Start Django server in background
python manage.py runserver 8000 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo ""
echo "🎉 AJAT is now running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/api"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait