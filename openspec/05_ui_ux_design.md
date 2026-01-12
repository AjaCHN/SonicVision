# OpenSpec: 05 UI/UX 与交互规范

## 1. 状态控制逻辑
### 1.1 闲置处理 (Idle Logic)
- **触发条件:** 3000ms 内无鼠标移动或键盘操作。
- **行为表现:** 
  - **Mini Bar:** 透明度降至 15% (`opacity-[0.15]`)，沿 Y 轴向下偏移 2px。
  - **Mouse Cursor:** 根据 `settings.hideCursor` 执行隐藏。
- **恢复:** 任意交互动作立即恢复 100% 透明度。

### 1.2 设置面板行为
- **透明度:** 强制锁定为 90% (`bg-[#060608]/90`)，不受闲置状态影响。
- **滚动:** 采用极简自定义滚动条 (`custom-scrollbar`)，宽度 4px。

## 2. 歌词渲染规范 (Lyrics Typography)
- **Karaoke Style:** `FontWeight: 900`。实时缩放受 `bassNormalized * 0.45` 驱动。
- **Minimal Style:** `FontWeight: 300`, `letter-spacing: 4px`。透明度随振幅产生呼吸感。

## 3. 键盘映射映射表 (Keybindings)
| 按键 | 功能描述 |
| :--- | :--- |
| `Space` | 切换麦克风监听状态 |
| `R` | 随机化视觉模式与配色方案 |
| `F` | 切换全屏沉浸模式 |
| `L` | 切换 AI 歌词/信息显示 |
| `H` | 快速隐藏/显示 UI 面板 |
| `Arrows` | 切换上一个/下一个 视觉模式或主题 |