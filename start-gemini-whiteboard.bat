@echo off
echo 🚀 Starting Tutoroo Whiteboard with Google AI Studio (Gemini)
echo ================================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
call npm install

echo.
echo 🐍 Setting up Python backend for Gemini...
cd backend
pip install -r requirements.txt

echo.
echo 🎨 Starting frontend development server...
start "Tutoroo Frontend" cmd /k "cd .. && npm run dev"

echo.
echo 🤖 Starting Gemini backend server...
start "Gemini Backend" cmd /k "python app.py"

echo.
echo ✅ Setup complete! Your AI-powered whiteboard is ready!
echo.
echo 📋 Access Points:
echo    Frontend: http://localhost:5173/whiteboard
echo    Backend API: http://localhost:5000
echo.
echo 🧪 Test the integration:
echo    cd backend
echo    python test_gemini.py
echo.
echo 📚 Features:
echo    • Real AI recognition using Google AI Studio (Gemini)
echo    • Handwritten mathematical expression recognition
echo    • LaTeX output support
echo    • High accuracy recognition
echo.
pause
