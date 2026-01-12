# SonicVision AI 🎵👁️

[中文文档](README_ZH.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.0-8E75B2?logo=google&logoColor=white)

**SonicVision AI** is an immersive, browser-based music visualization experience that transforms live audio into stunning generative art.

Powered by **Google Gemini 3.0 Pro**, it identifies songs, detects musical mood, and fetches synchronized lyrics in real-time using **Google Search Grounding** for high accuracy across global regions.

## 🚀 Key Features

### 🧠 AI Intelligence
- **Gemini 3.0 Integration** for multimodal audio analysis
- **Smart Gap Detection** for automatic song change recognition
- **Search Grounding** with real-time Google Searches for verification
- **Source Verification** with clickable Google links
- **Lyrics & Mood Detection** for enhanced UI experience
- **Region Prioritization** for context-aware identification

### 🎨 Visualizer Modes
- **Frequency Bars:** Classic mirrored spectrum analyzer
- **Neon Rings:** Concentric circles pulsing with mid-range frequencies
- **Starfield:** 3D particle field reacting to treble
- **Geometric Tunnel:** Hypnotic 3D tunnel responding to track energy
- **Plasma Flow:** Liquid color gradients pulsing with the beat
- **Abstract Shapes:** Geometric primitives dancing to specific frequencies
- **Ethereal Smoke:** Mystical dual-stream smoke effect
- **Water Ripples:** Raindrop effects triggered by bass kicks

### 🎛️ Customization
- 8 preset color themes (Cyberpunk, Sunset, Matrix, etc.)
- Adjustable sensitivity, speed, glow intensity, and motion trails
- Multiple lyrics styles: Standard, Karaoke, Minimal
- English and Chinese language support

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS, Custom Canvas API
- **Audio Processing:** Web Audio API
- **AI Integration:** Google GenAI SDK with Tool Use
- **Build Tool:** Vite

## 📦 Quick Start

### Prerequisites
- Node.js (v18+)
- Google Cloud Project with Gemini API enabled
- API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sonicvision-ai.git
   cd sonicvision-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🎮 Usage Tips
- Grant microphone access when prompted
- Disable "Noise Suppression" in your OS/browser for best results
- Use the bottom control bar to switch modes and adjust settings
- The app automatically identifies songs every ~30 seconds

## 🤝 Contributing

Contributions are welcome! Submit a Pull Request to help improve the project.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.