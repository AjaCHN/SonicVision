# OpenSpec: UI/UX 与交互规范

## 1. 视觉层级 (Z-Index)
- **Z-0:** 核心渲染器 (Canvas/WebGL)。
- **Z-10:** 歌词叠加层 (Lyrics Overlay)。
- **Z-20:** 歌曲信息徽章 (Song Badge)。
- **Z-30:** 迷你交互栏 (Mini Bar)。
- **Z-40:** 扩展设置面板 (Control Panel)。
- **Z-50:** 模态框与全局提示 (Help/Identifying)。

## 2. 交互状态
- **Idle Timeout:** 3000ms。
- **Mini Bar Behavioral Spec:** 
  - 非闲置: `opacity-100`, `translate-y-0`。
  - 闲置: `opacity-[0.15]`, `translate-y-2`。
- **Transitions:** 统一使用 `duration-700` 与 `ease-out`。

## 3. 键盘映射
- `Space`: `toggleMicrophone`
- `R`: `randomizeSettings`
- `F`: `toggleFullscreen`
- `L`: `setShowLyrics`
- `H`: 临时隐藏/显示 UI。
- `Arrow Keys`: 切换预设与主题。
