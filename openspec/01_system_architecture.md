# SonicVision AI 系统架构规范

## 1. 技术栈 (Technical Stack)
- **核心框架:** React 19 (ESM 导入)
- **视觉渲染:** 
  - 2D: HTML5 Canvas API
  - 3D: Three.js / @react-three/fiber / @react-three/drei
- **AI 引擎:** Google Gemini 3 (gemini-3-flash-preview)
- **音频处理:** Web Audio API (AnalyserNode / OfflineAudioContext)
- **样式方案:** Tailwind CSS 3.x
- **状态管理:** React Hooks (useState/useCallback) + localStorage 持久化

## 2. 数据流架构 (Data Flow)
应用遵循“采集-分析-表现”的闭环逻辑：
1. **音频采集 (Input):** 通过 `navigator.mediaDevices.getUserMedia` 获取音频流。
2. **频谱分析 (Processing):** `AnalyserNode` 提取 8 位频率数据 (Uint8Array)。
3. **视觉驱动 (Visualization):** 
   - 2D 引擎通过 `requestAnimationFrame` 循环渲染。
   - 3D 引擎利用 `useFrame` 驱动顶点位移。
4. **AI 闭环 (Intelligence):** 
   - 采样音频片断并生成 Base64 指纹。
   - 优先匹配 `fingerprintService` 本地缓存。
   - 缓存未命中则调用 `geminiService` 进行联网识别与歌词抓取。

## 3. 模块化设计
- `App.tsx`: 顶级容器，管理上下文与全局状态。
- `services/`: 纯逻辑层（视觉算法、AI 调用、指纹生成）。
- `components/`: 表现层组件（UI 控件、Canvas 容器、歌词叠加层）。
- `translations.ts`: 国际化 (i18n) 字典。
