# 📚 Tutoroo — The AI That Learns *With* You

> **Tutoroo** is an intelligent, adaptive learning companion that behaves like a real study partner — questioning your reasoning, coaching you through mistakes, and stepping in with explanations *only when you ask for help*.

---

## 🚀 Overview

Learning is often isolating — many students struggle alone, unsure if they’re on the right track or even asking the right questions. **Tutoroo** changes that.  
It’s not just another chatbot or tutoring app. Instead, it behaves like a *co-student* who learns beside you — asking curious questions, nudging you to explain your thinking, and then seamlessly transforming into a tutor the moment you say **"help"**.

By combining voice, vision, and machine learning, Tutoroo makes studying feel like a shared conversation — human, dynamic, and deeply engaging.

---

## ✨ Features

### 🧠 Dual Learning Modes

- **🤔 Co-Student Mode (Default):**  
  Tutoroo acts like a slightly clueless but curious classmate. It asks “dumb” or probing questions (“Wait, why are you dividing here?”) to make you explain your reasoning aloud — reinforcing your understanding in the process.

- **🎓 Tutor Mode (Voice-Activated):**  
  Say **"help"** and Tutoroo instantly shifts into a tutor role — providing a step-by-step solution, complete explanations, and helpful context. Once done, it steps back into Co-Student mode so you can keep leading the session.

---

### 🧰 Multimodal Understanding

Tutoroo doesn’t just read text — it *sees*, *hears*, and *understands* your learning process:

- 🎙️ **Microphone** — Listens to your reasoning, questions, and verbal problem-solving.  
- 🎥 **Camera** — Observes handwritten work, whiteboard solutions, or paper notes.  
- 🖥️ **Screen Share** — Understands digital content (e.g., Notion, Jupyter, Notability).  
- 👁️ **Eye Tracking** — Monitors focus and pacing to understand engagement.  
- 🙂 **Facial Emotion Recognition** — Detects confusion or confidence to adjust tone and timing.

---

### 📊 Real-Time Adaptation

Tutoroo builds a unique learning profile over time:

- Adjusts questioning style and hint frequency based on your behavior.  
- Uses gaze, tone, and response speed to estimate focus and frustration.  
- Learns how *you* learn — becoming more personalized and effective each session.

---

## 🧪 Demo Flow

Here’s how a typical study session works:

1. 📖 **Start Solving:** Tutoroo joins as a co-student and begins asking questions about your solution.  
2. 🧩 **Explain Your Reasoning:** Teaching the AI back reinforces your understanding.  
3. 🔄 **Get Stuck:** If you pause or feel lost, simply say **"help"**.  
4. 📚 **Instant Tutoring:** Tutoroo solves the problem step-by-step, explains key concepts, and hands control back to you.  
5. 📊 **Review Progress:** After the session, view detailed analytics and suggestions for what to focus on next.

---

## 🛠️ How We Built It

**Frontend:**  
- ⚛️ [React](https://react.dev/) + [Next.js](https://nextjs.org/) — responsive, Facetime-style UI  
- 🎨 [Tailwind CSS](https://tailwindcss.com/) — clean, accessible styling  
- 📹 WebRTC — real-time mic, camera, and screen input

**Backend:**  
- 🧠 [Gemini API](https://deepmind.google/technologies/gemini/) — multimodal reasoning across audio, visual, and text  
- 📦 Event-driven backend with message queue for low-latency inference  
- 🔐 [Auth0](https://auth0.com/) — secure authentication and encrypted session management

**Machine Learning & Data:**  
- 🔎 [PyTorch](https://pytorch.org/) — behavioral prediction (focus, frustration, learning patterns)  
- 🔄 Reinforcement learning — question difficulty & timing optimization  
- 🧠 Adaptive embeddings — personalized learning profiles  
- 👁️ [OpenCV](https://opencv.org/) + [MediaPipe](https://developers.google.com/mediapipe) — real-time gaze & emotion tracking  
- 🧪 [Snowflake](https://www.snowflake.com/) — session logs, analytics, and feedback loops  
- 🪶 [Airflow](https://airflow.apache.org/) — data pipelines & daily aggregation

**Voice System:**  
- 🗣️ [ElevenLabs](https://elevenlabs.io/) — realistic, emotionally aware speech synthesis  
- 🔊 NLP pre-processing for clarity and context

**Security & Performance:**  
- 🔐 AES-256 encryption + JWT tokens  
- ⚡ Async inference + TensorRT acceleration for real-time performance

---

## 🧠 Example Problem (Math)

Tutoroo can parse LaTeX and handwritten input:

2x^2 + 7x - 3 = 23
Solve for x

It observes your approach, asks why you’re isolating terms, questions your factor choices, and then — if you request — provides the full quadratic solution.

🏆 Challenges We Faced
Synchronizing camera, audio, and screen inputs in real time

Maintaining privacy while processing gaze and emotion data

Keeping inference latency under 500ms across multiple APIs

Building an adaptive model that learns over time without overfitting

Ensuring ElevenLabs speech output stayed natural for technical content

🏅 Achievements
Built one of the first AI study companions that learns with the user, not just for them

Created a multimodal, real-time system that sees, listens, and adapts

Developed a behavior-aware learning model that evolves over time

Integrated high-fidelity speech, emotion, and visual data into a single unified feedback loop

📚 What We Learned
🤝 AI becomes more powerful when it’s collaborative — not authoritative

📡 Synchronizing multiple input streams is challenging but enables richer interaction

🧠 Personalization isn’t a feature — it’s the foundation of impactful learning

♿ Accessibility should be baked in from the start — features like eye tracking and speech input make learning more inclusive

🔮 What’s Next
🌍 Multilingual support to make Tutoroo globally accessible

📊 Educator API so teachers can view anonymized engagement data (with consent)

🔐 Federated Learning for local personalization and improved privacy

🚀 Integration with Gemini 2.0 streaming API for even faster, more accurate reasoning

📈 Enhanced analytics dashboards built directly into the product

🧰 Built With
⚛️ React / Next.js

🐍 Python / PyTorch / TensorFlow

🧠 Gemini API

📸 OpenCV / MediaPipe

🔊 ElevenLabs

❄️ Snowflake / SQL

🔐 Auth0

💻 TypeScript / JavaScript

🤝 Team
Zaviar Durrani – Frontend, UX, AI architecture

Arish Shahab – Backend, Gemini integration, data pipeline

Ansh – Machine learning, adaptive modeling

📸 Screenshots
(Add screenshots of the interface, tutor mode vs co-student mode, dashboard, etc.)

🚀 Getting Started
bash
Copy code
# Clone the repo
git clone https://github.com/yourusername/tutoroo.git

# Install dependencies
cd tutoroo/frontend
npm install

# Start development server
npm run dev

# Backend setup (example)
cd ../backend
pip install -r requirements.txt
python main.py
📄 License
MIT License © 2025 Tutoroo Team
