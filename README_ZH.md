
# Aura Vision 🎵👁️

### AI 驱动的 3D 音乐可视化与识别平台 (v0.4.0)

[English](README.md) | [在线演示](https://aura.tanox.net/)

![License](https://img.shields.io/badge/License-GPL%20v2-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?logo=three.js&logoColor=black)
![Gemini AI](https://img.shields. Korea/badge/AI-Gemini%203.0-8E75B2?logo=google&logoColor=white)

**Aura Vision** 是一个完全基于浏览器的沉浸式视听实验。它结合了 **WebGL** (Three.js) 的高性能 3D 生成艺术与 **Google Gemini 3.0** 的多模态 AI 能力，能够将麦克风捕捉的音频转化为震撼的视觉效果，并实时识别歌曲。

<p align="center">
  <img src="assets/images/preview_main.png" width="48%" alt="Aura Vision 主界面" />
  <img src="assets/images/preview_ui.png" width="48%" alt="Aura Vision 设置面板" />
</p>

---

## ✨ 核心特性

*   **🧠 多模态 AI 智能:** 由 `gemini-3-flash-preview` 驱动。通过聆听实时音频识别曲目，分析音乐情绪并自动调整视觉配色。
*   **🎨 高保真 3D 引擎:** 包含 **流光绸缎 (Silk Waves)**、**液态星球** 等高级 WebGL 模式，支持物理材质渲染、全局光晕及色差补偿。
*   **🔠 节奏感官文字:** 支持自定义文字图层（如 "AURA"），文字会随低音频率实时震动、缩放及闪烁。
*   **⚡ 智能闲置隐藏:** 极简交互工具栏，在检测到用户停止操作 3 秒后自动进入半透明闲置状态，提供纯净的观赏体验。
*   **🌊 丝滑色彩过渡:** 内置高精度色彩插值算法，在切换色盘或模式时实现如呼吸般自然的视觉演化。
*   **🔍 搜索增强识别:** 集成 Google Search 搜索工具，即使是冷门或翻唱曲目也能通过实时联网获取精准元数据。

## 🛠️ 技术栈

*   **核心:** React 19, TypeScript, Vite
*   **图形:** Three.js, @react-three/fiber, 后期处理 (Bloom, Chromatic Aberration)
*   **AI:** Google GenAI SDK (`@google/genai`)
*   **样式:** Tailwind CSS (预览环境支持动态渲染)

## 🚀 快速开始

1.  **克隆并安装**
    ```bash
    git clone https://github.com/AjaCHN/AuraVision.git
    cd AuraVision && npm install
    ```

2.  **配置 API 密钥**
    在环境变量中配置 `API_KEY`（需支持 Gemini 3 的 Google AI Studio 密钥）。

3.  **运行**
    ```bash
    npm run dev
    ```

> **🎧 关键提示:** 请在浏览器设置中关闭麦克风的“自动增益控制”或“回声消除”，以保留完整的低音和高音频谱，使视觉跳动更加精准。

## 📄 许可证

基于 GNU General Public License v2.0 许可证分发。

---
*Made with 💜 using React and Google Gemini API*
