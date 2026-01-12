# OpenSpec: 02 音频引擎与信号规范

## 1. 采集约束 (Input Constraints)
为了获取最真实的音乐动态，系统在调用 `getUserMedia` 时必须强制禁用系统级音频处理：
- `echoCancellation: false` (回声消除)
- `noiseSuppression: false` (噪声抑制)
- `autoGainControl: false` (自动增益控制)

## 2. 频谱分析 (Real-time Analysis)
- **FFT Size:** 支持 512 / 1024 / 2048 / 4096 动态切换。
- **Smoothing:** `smoothingTimeConstant` 范围 [0, 0.95]，默认 0.8。
- **频段映射:**
  - **Bass (0-20 bins):** 用于驱动全局缩放、3D 顶点位移增益。
  - **Mids (20-100 bins):** 用于驱动几何形态变化、歌词缩放。
  - **Highs (100+ bins):** 用于驱动粒子加速度、Lasers 抖动。

## 3. 声学指纹 (Acoustic Fingerprinting)
- **原理:** 采用“Bag of Dominant Peaks”特征提取算法。
- **提取逻辑:** 
  1. 使用 `OfflineAudioContext` 在非 UI 线程解码 Base64 音频。
  2. 每 200ms 执行一次 FFT 扫描。
  3. 提取 0-4300Hz 范围内振幅超过 50 的主频点索引。
- **匹配逻辑:** 
  - 算法: **Jaccard Similarity** (交并比)。
  - 阈值: `SIMILARITY_THRESHOLD = 0.25`。
  - 缓存: 存储最近 50 首成功识别的歌曲特征。