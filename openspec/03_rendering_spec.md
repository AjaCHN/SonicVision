# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection) - v0.8.0
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 
  - 计算当前帧与上一帧在低频段 (0-600Hz) 的能量增量。
  - 仅统计正向增量 (Onsets)。
  - 维护一个动态阈值 (Moving Average) 以适应不同音量的歌曲。
  - **结果:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
所有 2D 渲染器实现 `IVisualizerRenderer` 接口，必须兼容 `OffscreenCanvasRenderingContext2D`。

- **PlasmaFlow:** 
  - 逻辑：通过 `Math.sin/cos` 混合生成多层径向渐变，速度受 `settings.speed` 线性缩放。
- **Starfield (星际穿越):** 
  - 逻辑：通过一个缓慢漂移的引力中心点引导粒子。
  - **Beat Reaction:** 节拍触发粒子速度的瞬时激增 (Surge)。
- **Nebula (深空星云):** 
  - 逻辑：多层粒子系统与离屏 Canvas 缓存的 Sprite 贴图混合。
- **Rings (霓虹环):**
  - **Beat Reaction:** 节拍触发环形波纹的线宽爆发与半径跳动。

## 3. 3D WebGL 渲染
- **SilkWaves (流光绸缎):** 材质 `emissiveIntensity` 随节拍闪烁。
- **Liquid Sphere (液态星球):** 顶点置换 (Vertex Displacement) 强度随低频能量非线性增强。
- **Low-Poly Terrain:** 地形移动速度随 `treble` 能量动态调整。

## 4. 性能优化 (Performance)
- **离屏渲染:** 2D 绘图指令全部移至 Web Worker。
- **对象池:** 粒子系统 (Particles, Bubbles) 使用对象池模式，避免 GC 抖动。
- **精度控制:** `settings.quality` 控制粒子数量上限 (High: 250, Low: 80)。

---
*Aura Vision Rendering - Version 0.8.0*