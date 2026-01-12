# SonicVision AI 🎵👁️

[English](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.0-8E75B2?logo=google&logoColor=white)

**SonicVision AI** 是一个沉浸式的、基于浏览器的音乐可视化体验，将实时音频转化为令人惊叹的生成艺术。

由 **Google Gemini 3.0 Pro** 驱动，它不仅可以可视化音乐，还能识别歌曲、检测音乐情绪，并实时获取同步歌词。通过 **Google Search Grounding** 技术，确保全球范围内歌曲识别的高准确率。

## 🚀 核心功能

### 🧠 AI 智能
- **Gemini 3.0 集成**：使用最新模型进行多模态音频分析
- **智能切歌检测**：自动识别歌曲间的空白，立即触发新歌识别
- **搜索增强**：AI 转录歌词并执行实时 Google 搜索验证
- **来源验证**：提供可点击的 Google 链接验证识别结果
- **歌词与情绪检测**：自动获取歌词并检测音乐氛围
- **区域优先**：根据选择的区域进行上下文感知识别

### 🎨 可视化模式
- **频率条**：经典镜像频谱分析仪
- **霓虹光环**：随中频脉动的同心圆
- **星空**：响应高音的 3D 粒子场
- **几何隧道**：对轨道能量做出反应的催眠 3D 隧道
- **等离子流**：随节拍脉动的流体颜色渐变
- **抽象形状**：随特定频率舞动的几何图元
- **空灵烟雾**：神秘的双向烟雾效果
- **水波纹**：由低音触发的雨滴效果

### 🎛️ 个性化定制
- 8 种预设颜色主题（赛博朋克、日落、黑客帝国等）
- 可调整灵敏度、速度、发光强度和运动拖尾
- 多种歌词样式：标准、卡拉OK、极简
- 中英文语言支持

## 🛠️ 技术栈
- **前端**：React 19, TypeScript
- **样式**：Tailwind CSS, Custom Canvas API
- **音频处理**：Web Audio API
- **AI 集成**：Google GenAI SDK with Tool Use
- **构建工具**：Vite

## 📦 快速开始

### 前提条件
- Node.js (v18+)
- 已启用 Gemini API 的 Google Cloud 项目
- 来自 [Google AI Studio](https://aistudio.google.com/) 的 API 密钥

### 安装
1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/sonicvision-ai.git
   cd sonicvision-ai
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env` 文件：
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **运行开发服务器**
   ```bash
   npm run dev
   ```

5. **构建生产版本**
   ```bash
   npm run build
   ```

## 🎮 使用技巧
- 首次启动时授予麦克风访问权限
- 禁用操作系统或浏览器的"噪声抑制"功能以获得最佳效果
- 使用底部控制栏切换模式和调整设置
- 应用每约 30 秒自动识别一次歌曲

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request 帮助改进项目。

## 📄 许可证

基于 MIT 许可证分发。查看 `LICENSE` 了解更多信息。