# SonicVision AI 智能与数据规范

## 1. AI 识别策略 (Gemini 3)
### 1.1 模型配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch` (Google 搜索增强)。
- **输出格式:** `application/json`。

### 1.2 识别逻辑
1. **输入:** 5-10 秒的 WebM 格式音频片断。
2. **提示词 (Prompt):**
   - 包含 `language` 上下文（中/英/日等）。
   - 包含 `region` 市场定位信息。
   - 要求输出 `title`, `artist`, `lyricsSnippet`, `mood`, `identified`。
3. **结构化输出:** 使用 `responseSchema` 强制执行对象属性及其类型。

## 2. 声学指纹算法 (Acoustic Fingerprinting)
### 2.1 特征提取
- 使用 `OfflineAudioContext` 在非 UI 线程进行 FFT 变换。
- **采样频率:** 每 200ms 抓取一个主频点。
- **特征值:** 选取 0Hz - 4300Hz 范围内的优势峰值索引。

### 2.2 匹配逻辑
- **算法:** 杰卡德相似性系数 (Jaccard Similarity)。
- **阈值:** `SIMILARITY_THRESHOLD = 0.25`。
- **本地缓存:** `localStorage` 存储最近 50 首识别成功的歌曲。

## 3. 状态持久化 (Storage)
- **Key 格式:** `sv_v6_[property_name]`。
- **同步点:** 每次状态 (state) 变更时触发 `useEffect` 自动更新 localStorage。
- **版本号:** `v6` (用于在规范变更时强制清除旧缓存)。

## 4. 音频处理细节
- **FFT Size:** 支持 512 / 1024 / 2048 / 4096 (默认 512)。
- **Smoothing:** `smoothingTimeConstant` 默认 0.8。
- **约束条件:** `echoCancellation: false`, `noiseSuppression: false`（获取原始音频细节）。
