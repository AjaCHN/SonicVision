# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 5.2 (Rollup)
- **Runtime:** React 19.0.0 (生产环境由构建工具管理依赖，严禁使用浏览器级 importmap 干扰别名解析)
- **Language:** TypeScript 5.4
- **Styling:** Tailwind CSS 3.4 (PostCSS)
- **Engine:** 
  - **2D (Optimized):** OffscreenCanvas API + Web Workers (ESM 模块化加载)
  - **3D:** Three.js (r160) / @react-three/fiber v9
- **Intelligence:** Google Gemini 3 (Flash Preview)
- **Audio:** Web Audio API (实时频域分析)

## 2. 模块解析与 Worker
- **路径策略:** 内部引用强制使用标准相对路径 (`./` 或 `../`)。
- **Worker 加载:** 采用 `new Worker(new URL(...), { type: 'module' })` 模式，确保与 Vite 别名逻辑兼容。
- **离屏架构:** 渲染线程 (Worker) 独立处理 2D Canvas 绘图，主线程仅负责音频采样与状态管理。

## 3. 并发安全性
- **React 19 Compatibility:** 采用 `createRoot` 并全面支持 React 19 的新生命周期。
- **Initialization Locks:** 在 `VisualizerCanvas` 等关键组件中通过 `initializedRef` 防止双重挂载引起的 Worker 多实例冲突。

---
*Aura Vision Architecture - Version 1.2.0*