# Aura Vision 🎵👁️

### AI 驱动的 3D 音乐可视化与曲目识别系统 (v1.0.0)

[English](README.md) | [在线演示](https://aura.tanox.net/) | [更新日志](CHANGELOG.md)

<!-- README.md -->
![Banner](assets/images/aura-banner.jpg)

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-white?logo=three.js&logoColor=black" />
  <img src="https://img.shields.io/badge/AI-Gemini%203.0-8E75B2?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Perf-离屏渲染-orange" />
  <img src="https://img.shields.io/badge/License-GPL%20v2-blue.svg" />
</p>

**Aura Vision** 是一款将实时音频转化为沉浸式 3D 生成艺术的高端 Web 应用。它结合了 **OffscreenCanvas** 多线程渲染技术与 **Google Gemini 3.0** 多模态大模型，不仅能以 60FPS 流畅帧率随律动起舞，更能实时识别歌曲内容并自动调整视觉情绪。

---

## ⚡ v1.0.0 "Robustness and Alignment" 更新亮点

*   **构建系统对齐:** 移除了 `index.html` 中的 `importmap` 和 CDN 样式引用，完全符合 Vite 构建流程和 OpenSpec 规范。
*   **Web Worker 稳定性:** 修复了 `visualizer.worker.ts` 中 `NebulaRenderer` 错误使用 `document` 对象的缺陷，确保了 Worker 线程的稳定运行。
*   **AI 策略优化:** 改进了 `geminiService.ts` 中的系统指令和响应 Schema，明确指示 AI 进行更精确的语言本地化（原文并加括号翻译），并统一品牌名称为“AI 通感引擎”。
*   **音频指纹重构:** 彻底重构了 `fingerprintService.ts`，现在它能更准确地在 `OfflineAudioContext` 中捕获 FFT 数据以生成声学指纹，提升了本地歌曲匹配的准确性。
*   **TypeScript 环境清理:** 移除了冗余的 `vite-env.d.ts` 文件，因为 `tsconfig.json` 已正确引用 Vite 客户端类型。

---

## 📸 视觉展示

| 极光之舞 | 液态星球 (3D) | 液态等离子 |
| :---: | :---: | :---: |
| ![极光之舞](assets/images/showcase-aurawave.jpg) | ![液态星球](assets/images/showcase-liquid.jpg) | ![液态等离子](assets/images/showcase-plasma.jpg) |

---

## 🎮 使用指南

**🚀 快速开始:** 直接在電腦或手機瀏覽器中訪問 **[在線演示](https://aura.tanox.net/)** 即可。

1.  **授權權限:** 點擊“開啟體驗”，允許瀏覽器訪問麥克風。
2.  **播放音樂:** 在設備附近播放音樂。視覺效果將根據實時採樣跳動。
3.  **探索模式:** 打開**設置面板** (按 `H`) 切換 12+ 種視覺引擎。
4.  **AI 識別:** 按 `L` 鍵開啟“AI 曲目識別”以分析當前歌曲。

---
*Made with 💜 using React and Google Gemini API*