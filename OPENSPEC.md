# SonicVision AI - OpenSpec 规范主文档

本项目严格遵循 **OpenSpec** 标准进行架构设计与文档编写。SonicVision AI 是一项融合了高性能实时频谱分析与 Google Gemini 3 系列生成式 AI 的沉浸式视听交互实验。

## 规范体系结构 (Directory Structure)

1.  **[架构与设计规范 (01_Architecture)](./openspec/01_architecture.md)**
    *   技术栈、核心生命周期、数据流向。
2.  **[音频引擎与信号规范 (02_Audio_Engine)](./openspec/02_audio_engine.md)**
    *   Web Audio 采集、FFT 分析、声学指纹算法。
3.  **[视觉生成渲染规范 (03_Visual_Engines)](./openspec/03_visual_engines.md)**
    *   2D 策略模式渲染器、3D WebGL 顶点位移算法。
4.  **[AI 智能与语义规范 (04_AI_Intelligence)](./openspec/04_ai_intelligence.md)**
    *   Gemini 3 模型配置、搜索增强 (Search Grounding) 与结构化输出。
5.  **[UI/UX 与交互规范 (05_UI_UX_Design)](./openspec/05_ui_ux_design.md)**
    *   状态转换、闲置隐藏逻辑、快捷键映射。
6.  **[持久化与国际化规范 (06_Persistence_i18n)](./openspec/06_persistence_i18n.md)**
    *   LocalStorage Schema、多语言支持逻辑。

---
*SonicVision AI Project Specification - Version 0.2.3*