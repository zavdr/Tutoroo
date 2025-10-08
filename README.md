# 📚 Tutoroo — the AI that learns *with* you

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=for-the-badge&logo=openai&logoColor=white)
![Snowflake](https://img.shields.io/badge/Snowflake-29B5E8?style=for-the-badge&logo=snowflake&logoColor=white)

An intelligent, adaptive learning companion that behaves like a real study partner — questioning your reasoning, coaching you through mistakes, and stepping in with explanations *only when you ask for help*.

---

## 🚀 highlights

- 🧠 dual-mode learning: co-student (default) + tutor (voice-activated by saying "help")
- 🧑‍🎓 simulates real peer learning by asking “curious” or “dumb” questions  
- 🎙️ multimodal input (microphone, camera, screen, gaze, emotion)  
- 🧪 adaptive behavior that learns how *you* learn  
- 📊 personalized feedback dashboard with analytics  
- 🔐 privacy-first design with encrypted session data

---

## 🧩 features

### 🧠 dual learning modes
- **co-student mode:** Tutoroo acts like a slightly clueless classmate, asking simple or probing questions (“Wait, why are you dividing here?”) to encourage deeper explanation and reasoning.
- **tutor mode:** Activated when you say “help.” Tutoroo instantly provides a complete, step-by-step solution, explains key concepts, then steps back into co-student mode.

### 🧰 multimodal understanding
- 🎙️ **microphone:** listens to reasoning and verbal problem-solving  
- 🎥 **camera:** observes handwritten work or whiteboard solutions  
- 🖥️ **screen share:** understands digital workspace context  
- 👁️ **eye tracking:** monitors attention and pacing  
- 🙂 **facial emotion recognition:** detects confusion, frustration, or confidence to adapt tone and timing  

### 📊 real-time adaptation
- adjusts question difficulty and hint frequency based on behavior  
- analyzes tone, gaze, and response time to estimate engagement  
- builds a personalized learning profile that evolves over time  

---

## 🧪 demo flow

1. 📖 **start solving:** Tutoroo begins as a co-student, asking questions about your work.  
2. 🧩 **explain your reasoning:** Teaching it back reinforces your understanding.  
3. 🔄 **get stuck:** If you’re lost, say “help.”  
4. 📚 **instant tutoring:** Step-by-step explanations appear instantly.  
5. 📊 **review:** See analytics and personalized recommendations after the session.

---

## ⚙️ tech stack

**frontend**
- ⚛️ React + Next.js — responsive Facetime-style UI  
- 🎨 Tailwind CSS — minimal, accessible design  
- 📹 WebRTC — real-time mic, camera, and screen streaming  

**backend**
- 🧠 Gemini API — multimodal reasoning (text, vision, audio)  
- 📦 event-driven message queue — low-latency inference  
- 🔐 Auth0 — secure authentication + session management  

**machine learning & data**
- 🔎 PyTorch — behavior and frustration prediction  
- 🔄 reinforcement learning — adaptive timing & difficulty  
- 👁️ OpenCV + MediaPipe — gaze + emotion recognition  
- 🧪 Snowflake — data storage & analytics  
- 🪶 Airflow — pipeline orchestration  

**voice system**
- 🗣️ ElevenLabs — realistic, natural TTS output  
- 🔊 NLP pre-processing — clarity and contextual speech  

**security & performance**
- 🔐 AES-256 encryption, JWT tokens  
- ⚡ async inference + TensorRT acceleration

---

## 🧠 example problem

```latex
2x^2 + 7x - 3 = 23
Solve for x
