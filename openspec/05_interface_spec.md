
# OpenSpec: UI/UX 与交互规范

## 1. 视觉层级 (Z-Index)
- **Z-0:** 核心渲染器 (Canvas/WebGL)。
- **Z-20:** 歌曲信息与歌词徽章。
- **Z-30:** 迷你交互栏 (Mini Bar)。
- **Z-40:** 扩展设置面板 (Control Panel)。
- **Z-100:** 自定义文字层 (Custom Text Overlay)。

## 2. 交互状态
- **Idle Timeout:** 3000ms。
- **全平台闲置检测:** 为了兼容平板电脑与触摸设备，检测逻辑必须包含 `touchstart` 和 `touchmove` 事件。
- **Mini Bar 视觉规范:** 
  - **活跃状态:** `opacity-100`, `backdrop-blur-3xl`, `bg-black/60`。
  - **闲置状态 (Idle):** `opacity-[0.12]`, `translate-y-2`, **移除 backdrop-blur 效果**。
  - *设计目的：在闲置时通过移除模糊滤镜，使工具栏完全透明化，避免在暗色背景下产生浑浊的视觉干扰。*

## 3. 键盘映射
- `Space`: `toggleMicrophone`
- `R`: `randomizeSettings`
- `F`: `toggleFullscreen`
- `L`: `setShowLyrics`
- `H`: 临时隐藏/显示 UI。

## 4. 组件一致性
- **控制面板布局:** 采用 `grid-cols-1 lg:grid-cols-3` 的响应式网格。
- **开关组件:** 采用纯视觉胶囊开关设计，移除 "ON/OFF" 文字描述，提高国际化适配度。
