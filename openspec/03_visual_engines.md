# OpenSpec: 03 视觉生成渲染规范

## 1. 2D 策略模式渲染器
所有 2D 渲染器必须遵循 `IVisualizerRenderer` 接口，支持上下文注入与实时切换。

### 1.1 艺术算法详解
- **Plasma Flow:** 基于多重 Sine/Cosine 函数叠加。`z = sin(x*0.1 + time) * cos(y*0.1 + time)`，受 `speed` 设置线性加速。
- **Nebula:** 采用“Sprite 烘焙”技术。在离屏 Canvas 生成径向渐变，利用 `globalCompositeOperation = 'screen'` 实现亮部叠加。
- **Lasers:** 模拟舞台灯光。基准点固定于底部两侧及中心，基于高频能量触发 Jitter (抖动) 偏移。
- **Kaleidoscope:** 12 分段镜像反射。将当前 Canvas 渲染内容进行极坐标变换。

## 2. 3D WebGL 渲染 (React Three Fiber)
### 2.1 顶点位移逻辑
- **Silk Waves (SILK):** 
  - 几何体：`PlaneGeometry(60, 60, 100, 100)`。
  - 位移函数：`z = (z1 + z2 + z3) * audioAmp + ripple`。
  - z1/z2/z3：不同频率的噪声函数，模拟绸缎褶皱。
- **Liquid Sphere (LIQUID):** 
  - 几何体：`IcosahedronGeometry(4, 3)`。
  - 逻辑：基于法线方向的位移。置换系数 = `1 + noise * (0.3 + reactivity)`，其中 `reactivity` 由低音频率决定。

## 3. 后期处理 (Post-Processing)
- **Bloom:** 基于亮度阈值 (0.2) 的泛光，强度受 `settings.glow` 控制。
- **Trails:** 在 2D 模式下，每帧不完全清除背景，使用 `ctx.fillStyle = rgba(0,0,0, alpha)` 覆盖实现视觉残留。