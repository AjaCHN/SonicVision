
# OpenSpec: 渲染规范

## 1. 2D 策略模式渲染器
所有 2D 渲染器实现 `IVisualizerRenderer` 接口，支持实时切换。

- **PlasmaFlow:** 
  - 逻辑：通过 `Math.sin/cos` 混合生成多层径向渐变，速度受 `settings.speed` 线性缩放。
- **Starfield:** 
  - 逻辑：3D 透视投影粒子系统，采用线性轨迹（Linear Trajectory）。
- **Nebula:** 
  - 逻辑：Sprite 贴图混合。使用离屏 Canvas 预烘焙高斯模糊粒子。

## 2. 3D WebGL 渲染
- **通用优化:**
  - **DPR Cap:** 低画质锁定 0.8x，中画质 1.2x，高画质上限 2.0x。
  - **Flat Shading:** 低画质下启用平面着色，减少光照计算开销。

- **Silk Waves (Vertex Displacement):** 
  - 位移函数：`z = sin(x * freq + time) * cos(y * freq + time) * amplitude`。

## 3. 后期处理管道 (Post-Processing)
根据 `settings.quality` 动态挂载 Pass：
- **High:** Bloom + Chromatic Aberration + TiltShift。
- **Low:** 仅 Bloom (禁用 Mipmap Blur 以加速)。

## 4. 动态演化与稳定性 (Evolution & Stability)
- **色彩平滑过渡:** 采用线性插值 (Lerp) 算法，插值系数设定为 `0.05`（针对 60FPS 深度优化），确保 0.5-1 秒内完成主题变换。
- **颜色数组对齐 (Array Sync):** 为了防止在主题颜色数量变化（如从 3 色变为 2 色）时产生 `undefined` 导致的黑屏，渲染器在执行插值前必须：
  1. 检查 `currentColors` 与 `targetColors` 长度。
  2. 若长度不一，使用当前数组的末位颜色填充或裁剪 `currentColors` 至目标长度。
  3. 确保所有渲染逻辑引用合法的颜色索引。
