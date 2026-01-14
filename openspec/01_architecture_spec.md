
# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 5.2 (Rollup)
- **Runtime:** React 18.3+
- **Language:** TypeScript 5.4
- **Styling:** 
  - Tailwind CSS 3.4 (PostCSS)
  - **Compatibility Fix:** 预览环境采用 HTML `<link>` 标签引入原生 CSS，并结合 Tailwind Play CDN 进行实时解析，以解决原生 ESM 环境下 JS 导入 CSS 导致的样式丢失问题。
- **Engine:** 
  - 2D: Canvas 2D API (策略模式封装)
  - 3D: Three.js (r164) / @react-three/fiber
- **Intelligence:** Google Gemini 3 (Flash Preview)
- **Audio:** Web Audio API (实时分析 + 离线解码)

## 2. 目录结构 (Directory Structure)
```
/
├── assets/                # 静态资源
│   ├── styles/            # 样式文件 (index.css)
│   ├── locales/           # 语言文件
│   └── images/            # 应用截图与预览图 (preview_main.png, preview_ui.png)
├── components/            # UI 组件层
│   ├── App.tsx            # 应用主入口组件
│   ├── controls/          # UI 控制面板
│   ├── visualizers/       # 渲染容器
│   └── ui/                # 信息覆盖层 (歌词, 提示等)
├── core/                  # 核心业务逻辑 (整合层)
│   ├── constants/         # 全局常量与配置
│   ├── hooks/             # 自定义 React Hooks (如 useAudio)
│   ├── i18n/              # 国际化配置入口
│   ├── services/          # 核心服务逻辑
│   │   ├── renderers/     # 具体视觉模式渲染实现
│   │   ├── geminiService.ts
│   │   └── fingerprintService.ts
│   └── types/             # 全局 TypeScript 类型定义
├── openspec/              # OpenSpec 系统规范文档 (本项目)
└── index.tsx              # 应用挂载点
```

## 3. 应用生命周期
1. **Bootstrap:** 检测浏览器权限，初始化 `AudioContext`。
2. **Context Management:** 采用 Ref 追踪实例，执行清理（Cleanup）或切换设备时严格检查 `state !== 'closed'`，防止错误。
3. **Idle State:** 保持低功耗监听，等待 `analyser` 激活。
4. **Main Loop:** 
   - 采样: 每帧通过 `getByteFrequencyData` 获取频域数据。
   - 渲染: 将数据注入当前活动的渲染策略类。
   - 识别: 周期性触发音频快照，发送至 Gemini AI 进行识别。

## 4. 模块依赖图
- **App:** 状态中枢 (State Source of Truth)，协调音频上下文与组件通信。
- **Core:** 提供所有业务支撑，确保 UI 组件仅负责展示。
- **Services:** 封装底层 API 调用 (Gemini, Web Audio, LocalStorage)。
