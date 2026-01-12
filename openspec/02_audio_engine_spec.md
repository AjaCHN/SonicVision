# OpenSpec: 音频引擎规范

## 1. 采集规范
- **采样源:** 用户选择的 `audioinput` 媒体流。
- **约束配置:** 
  ```json
  {
    "echoCancellation": false,
    "noiseSuppression": false,
    "autoGainControl": false
  }
  ```
  *注意：必须禁用这些功能以获取原始音乐动态。*

## 2. 频谱分析 (Real-time FFT)
- **FFT Size:** 默认 512 (256 频段)。
- **Smoothing:** 默认 0.8，可在 UI 调整。
- **频段分布:** 
  - **Bass (0-15):** 驱动脉冲与全局缩放。
  - **Mids (15-60):** 驱动几何形变与复杂运动。
  - **Highs (100+):** 驱动粒子加速与光效触发。

## 3. 声学指纹 (Acoustic Fingerprinting)
- **采样频率:** 200ms。
- **特征维度:** 选取 0-4300Hz 范围内的优势峰值索引。
- **匹配算法:** Jaccard 相似度（阈值 0.25）。
- **流程:** 快照 -> Base64 -> Offline Context 解码 -> FFT 扫描 -> 特征 Set。
