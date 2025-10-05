@echo off
echo 🤖 Starting AI Math Tutor System
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
echo 🐍 Setting up Python backend with AI Tutor capabilities...
cd backend
pip install -r requirements.txt

echo.
echo 🎨 Starting frontend development server...
start "Tutoroo Frontend" cmd /k "cd .. && npm run dev"

echo.
echo 🤖 Starting AI Tutor backend server...
start "AI Tutor Backend" cmd /k "python app.py"

echo.
echo ✅ AI Math Tutor System is ready!
echo.
echo 📋 Features Available:
echo    • Document Upload & Processing (PDF, DOCX, TXT)
echo    • Conversational AI with Gemini + ElevenLabs
echo    • Real-time Work Monitoring & Error Detection
echo    • Contextual Help & Guidance
echo    • Voice-enabled AI Tutor
echo.
echo 🌐 Access Points:
echo    Frontend: http://localhost:5173
echo    AI Tutor: http://localhost:5173/ai-tutor
echo    Whiteboard: http://localhost:5173/whiteboard
echo    Backend API: http://localhost:5000
echo.
echo 🎯 How to Use:
echo    1. Upload math documents (PDF/DOCX/TXT) to train the AI
echo    2. Chat with the AI tutor about math concepts
echo    3. Draw math work and get real-time feedback
echo    4. Use voice chat for hands-free interaction
echo.
echo 🧠 AI Tutor Capabilities:
echo    • Learns from uploaded documents
echo    • Monitors your work for errors
echo    • Provides step-by-step guidance
echo    • Answers questions about math concepts
echo    • Speaks responses using ElevenLabs TTS
echo.
pause
