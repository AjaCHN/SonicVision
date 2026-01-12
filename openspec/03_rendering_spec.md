# OpenSpec: 渲染规范

## 1. 2D 策略模式渲染器
所有 2D 渲染器实现 `IVisualizerRenderer` 接口，支持实时切换。

- **PlasmaFlow:** 
  - 逻辑：通过 `Math.sin/cos` 混合生成多层径向渐变，速度受 `settings.speed` 线性缩放。
- **Starfield:** 
  - 逻辑：3D 透视投影粒子系统，`warpSpeed` 与中高频振幅正相关。
- **Nebula:** 
  - 逻辑：Sprite 贴图混合。使用离屏 Canvas 预烘焙高斯模糊粒子。

## 2. 3D WebGL 渲染
- **Silk Waves (Vertex Displacement):** 
  - `PlaneGeometry(100, 100)`。
  - 位移函数：`z = sin(x * freq + time) * cos(y * freq + time) * amplitude`。
- **Liquid Sphere (Dynamic Distortion):** 
  - 基于法线方向的位移。利用 `bassNormalized` 实时调整置换强度。

## 3. 后期处理管道
- **Post-Effects:** Bloom (发光), Chromatic Aberration (色散), TiltShift (景深)。
- **Motion Blur:** 通过 `globalAlpha` 控制 2D Canvas 的清除强度实现视觉持久。
