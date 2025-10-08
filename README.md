# 📚 Tutoroo — the AI that learns *with* you

![TypeScript](https://img.shields.io/badge/TypeScript-70.3%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-26.2%25-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Batchfile](https://img.shields.io/badge/Batchfile-1.6%25-4D4D4D?style=for-the-badge&logo=windows-terminal&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-0.9%25-563D7C?style=for-the-badge&logo=css3&logoColor=white)
![Shell](https://img.shields.io/badge/Shell-0.4%25-89E051?style=for-the-badge&logo=gnu-bash&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-0.4%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-0.2%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

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
