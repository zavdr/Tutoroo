#!/bin/bash

echo "🚀 Starting Tutoroo Whiteboard with Mathematical Expression Recognition"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "🎨 Starting frontend development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo "   Whiteboard page: http://localhost:5173/whiteboard"
echo ""

# Start frontend in background
npm run dev &

# Check if backend directory exists
if [ -d "backend" ]; then
    echo ""
    echo "🐍 Backend directory found. To start the AI recognition backend:"
    echo "   1. cd backend"
    echo "   2. python setup.py  # First time setup"
    echo "   3. python app.py    # Start the backend server"
    echo ""
    echo "   Backend will be available at: http://localhost:5000"
    echo "   Without backend, whiteboard will use mock recognition"
else
    echo ""
    echo "ℹ️  No backend directory found. Whiteboard will use mock recognition."
    echo "   To enable AI recognition, set up the backend as described in README_WHITEBOARD.md"
fi

echo ""
echo "✅ Setup complete! Your whiteboard is ready to use."
echo "   Navigate to http://localhost:5173/whiteboard to start drawing!"
echo ""
echo "📚 For more information, see README_WHITEBOARD.md"
