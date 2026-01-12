# OpenSpec: 01 架构与设计规范

## 1. 核心技术栈 (Technical Stack)
- **Runtime:** React 19 (ES6 Modules)
- **Visual Rendering:** 
  - 2D: HTML5 Canvas API (Context 2D)
  - 3D: Three.js + @react-three/fiber
- **Intelligence:** Google Gemini 3 (gemini-3-flash-preview)
- **Audio Processing:** Web Audio API (AnalyserNode / OfflineAudioContext)
- **Styling:** Tailwind CSS 3.4
- **Persistence:** LocalStorage API

## 2. 核心数据流 (Data Flow Model)
系统采用单向数据流结合实时反馈环：
1.  **输入层 (Capture):** 通过 `getUserMedia` 获取音频二进制流，注入 `AudioContext`。
2.  **分析层 (Analysis):** 
    - 实时：`AnalyserNode` 执行 FFT 转换，输出 `Uint8Array` 频谱数据。
    - 异步：`MediaRecorder` 采集 5s 片断，生成 Base64 指纹或发送至 AI。
3.  **渲染层 (Presentation):** 
    - 2D/3D 渲染器订阅频谱数据，映射至几何变换。
    - UI 叠加层订阅 AI 识别状态，展示元数据与歌词。

## 3. 应用生命周期 (App Lifecycle)
- **INITIALIZE:** 检查浏览器兼容性，读取本地持久化设置。
- **IDLE:** 显示欢迎页面，等待用户显式触发 `AudioContext` 激活。
- **ACTIVE:** 
  - 启动渲染循环 (`requestAnimationFrame`)。
  - 启动 AI 轮询任务 (默认 45s/次)。
- **TERMINATE:** 释放 MediaStream 轨道，关闭识别线程。