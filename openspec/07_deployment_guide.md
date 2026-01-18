# OpenSpec: 部署与环境规范

## 1. 先决条件
- **Node.js**: 18.x 或更高版本 (LTS)。
- **包管理器**: `npm` 或 `pnpm`。
- **API 密钥**: 一个有效的 Google Gemini API 密钥。

## 2. 本地开发
1.  **克隆仓库**: `git clone <repository-url>`
2.  **创建 `.env` 文件**: 在项目根目录创建一个名为 `.env` 的文件，并填入你的 API 密钥：
    ```env
    API_KEY=你的_GEMINI_API_KEY
    ```
    > **安全警告**: 绝不要将包含真实密钥的 `.env` 文件提交到公共 Git 仓库。

3.  **安装并运行**:
    ```bash
    # 安装依赖
    npm install
    # 启动开发服务器
    npm run dev
    ```
4.  在浏览器中访问 `http://localhost:5173`。请注意，应用必须运行在 `localhost` 或 `https` 协议下才能访问麦克风。

## 3. 生产环境部署
部署的核心是将 `npm run build` 命令生成的静态文件托管到服务器上。

### 构建步骤
在部署之前，你必须先构建项目。此命令会将 `API_KEY` 嵌入到最终的静态文件中。
```bash
# 确保在环境中设置了 API_KEY
API_KEY=你的_GEMINI_API_KEY npm run build
```
构建产物将位于 `build/` 目录中。

### 部署平台

#### 方案 A: Vercel (推荐)
1.  将你的 Git 仓库导入到 Vercel。
2.  配置项目设置：
    -   **框架预设 (Framework Preset):** `Vite`
    -   **构建命令 (Build Command):** `npm run build`
    -   **输出目录 (Output Directory):** `build`
3.  在 Vercel 项目设置中，添加 `API_KEY` 作为一个环境变量。
4.  部署。Vercel 将自动处理构建流程和 HTTPS 配置。

#### 方案 B: 腾讯云 EdgeOne
EdgeOne 适合需要在中国大陆地区实现低延迟访问的用户。
1.  **本地构建**: 在你的本地计算机上运行 `API_KEY=你的_GEMINI_API_KEY npm run build`。
2.  **访问 EdgeOne 控制台**: 登录腾讯云控制台，进入 EdgeOne 服务。
3.  **创建站点**: 新建一个静态站点托管实例。
4.  **上传文件**: 将本地 `build/` 目录下的所有文件上传到站点的文件管理器中。
5.  **配置域名**: 绑定你的自定义域名，并确保开启 HTTPS 以支持麦克风功能。
6.  **发布**: 发布站点。

---
*Aura Vision Deployment Guide - Version 0.8.0*