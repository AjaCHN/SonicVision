# SonicVision AI 视觉渲染规范

## 1. 渲染哲学
应用通过数学函数将离散的音频频率转化为连续的几何变换。支持 13 种核心模式。

## 2. 2D 渲染模式 (Canvas 2D)
### 2.1 基础频率模式
- **Frequency Bars (BARS):** 镜像频谱。计算 `64` 个频段，使用线性渐变填充。
- **Neon Rings (RINGS):** 同心圆弧。利用 `rotation` 变量控制旋转，圆弧长度受频率振幅 (`data[i]`) 动态影响。
- **Strobe Renderer (STROBE):** 网格矩阵。基于低音阈值 (`bass > 0.15`) 触发方块亮度。

### 2.2 艺术生成模式
- **Plasma Flow (PLASMA):** 多点径向渐变叠加。利用 `Math.sin/cos` 构建非线性运动路径，模拟流体。
- **Starfield (PARTICLES):** 粒子系统。`vx/vy` 受高频段影响，实现“超空间跳跃”感。
- **Nebula (NEBULA):** 粒子云。使用离屏 Canvas 预渲染发光 Sprite，通过 `globalCompositeOperation = 'screen'` 实现叠加亮度。
- **Lasers (LASERS):** 射线系统。从三个固定基点发射，根据 `googleSearch` 识别出的 Mood 调整抖动。

## 3. 3D 渲染模式 (WebGL/R3F)
### 3.1 顶点位移算法
- **Silk Waves (SILK):** 
  - **几何体:** 100x100 分段的 `PlaneGeometry`。
  - **逻辑:** 三层噪声函数叠加 (`z1 + z2 + z3`)。受低音灵敏度增益驱动产生全局涟漪。
- **Liquid Sphere (LIQUID):** 
  - **几何体:** `IcosahedronGeometry` (等二十面体)。
  - **逻辑:** 基于法线方向的顶点位移。置换系数受 `lowEnd` (低音) 实时调节。
- **Low-Poly Terrain (TERRAIN):** 
  - **逻辑:** 模拟飞行。`UV` 坐标随时间偏移，高度图受 `Math.sin/cos` 噪声和低音振幅共同决定。

## 4. 后期处理 (Post-Processing)
- **Bloom (发光):** 基于屏幕亮度的泛光处理，强度与音频灵敏度挂钩。
- **Trails (拖尾):** 在 2D 模式下通过半透明黑色矩形覆盖实现 (`alpha: 0.06 - 0.2`)。
