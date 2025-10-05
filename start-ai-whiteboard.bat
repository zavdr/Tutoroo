@echo off
echo 🚀 Starting AI-Powered Mathematical Whiteboard with Speech
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
echo 🐍 Setting up Python backend with AI and TTS...
cd backend
pip install -r requirements.txt

echo.
echo 🎨 Starting frontend development server...
start "Tutoroo Frontend" cmd /k "cd .. && npm run dev"

echo.
echo 🤖 Starting AI backend server with Gemini + ElevenLabs...
start "AI Backend" cmd /k "python app.py"

echo.
echo ✅ AI-Powered Whiteboard is ready!
echo.
echo 📋 Features Available:
echo    • Google AI Studio (Gemini) for mathematical recognition
echo    • ElevenLabs TTS for speaking expressions
echo    • Real-time drawing and recognition
echo    • Voice output of mathematical expressions
echo.
echo 🌐 Access Points:
echo    Frontend: http://localhost:5173/whiteboard
echo    Backend API: http://localhost:5000
echo.
echo 🧪 Test the integration:
echo    cd backend
echo    python test_tts.py
echo.
echo 🎯 How to Use:
echo    1. Draw mathematical expressions on the canvas
echo    2. Click "Recognize & Speak" to get AI recognition + voice
echo    3. Or use "Recognize Expression" then "Speak Result"
echo    4. The AI will speak the mathematical expression aloud!
echo.
pause
