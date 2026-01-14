
# Aura Vision 🎵👁️

### AI-Powered 3D Music Visualizer & Identifier (v0.4.0)

[中文文档](README_ZH.md) | [Live Demo](https://aura.tanox.net/)

![License](https://img.shields.io/badge/License-GPL%20v2-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?logo=three.js&logoColor=black)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.0-8E75B2?logo=google&logoColor=white)

**Aura Vision** is a next-gen audio visualization experiment running entirely in your browser. It combines **WebGL** (Three.js) for stunning 3D generative art with **Google Gemini 3.0** for real-time AI music identification and mood-reactive aesthetics.

<p align="center">
  <img src="assets/images/preview_main.png" width="48%" alt="Aura Vision Main Interface" />
  <img src="assets/images/preview_ui.png" width="48%" alt="Aura Vision Settings Panel" />
</p>

---

## ✨ Key Features

*   **🧠 Multimodal AI Intelligence:** Powered by `gemini-3-flash-preview`. Listens to your audio to identify songs, detect mood, and synchronize metadata with visual themes.
*   **🎨 High-Fidelity 3D Engines:** Immersive modes like **Silk Waves** and **Liquid Sphere** featuring PBR (Physically Based Rendering), bloom, and chromatic aberration.
*   **🔠 Reactive Typography:** Custom text overlay (e.g., "AURA") that pulses and scales dynamically with the bass frequencies.
*   **⚡ Intelligent Idle State:** Sleek, translucent controls that automatically hide during periods of inactivity to provide a pure cinematic experience.
*   **🌊 Seamless Transitions:** Advanced color interpolation ensuring butter-smooth blending when switching between curated visual themes.
*   **🔍 Search Grounding:** Real-time metadata verification via Google Search tools for pinpoint accuracy on global tracks.

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript, Vite
*   **Graphics:** Three.js, @react-three/fiber, Post-processing (Bloom, Chromatic Aberration, TiltShift)
*   **AI:** Google GenAI SDK (`@google/genai`)
*   **Styling:** Tailwind CSS (Runtime Play CDN for preview support)

## 🚀 Quick Start

1.  **Clone & Install**
    ```bash
    git clone https://github.com/AjaCHN/AuraVision.git
    cd AuraVision && npm install
    ```

2.  **Setup API Key**
    Ensure `API_KEY` is set in your environment (Google AI Studio key with Gemini 3 support).

3.  **Run**
    ```bash
    npm run dev
    ```

> **🎧 Pro Tip:** Disable browser noise suppression for your microphone to capture the full frequency spectrum (especially the bass) required for high-reactivity visuals.

## 📄 License

Distributed under the GNU General Public License v2.0.

---
*Made with 💜 using React and Google Gemini API*
