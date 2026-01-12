# OpenSpec: 04 AI 智能与语义规范

## 1. 模型配置 (Gemini 3)
- **模型 ID:** `gemini-3-flash-preview`。
- **输入模态:** 多模态 (Audio + Text)。
- **核心工具:** `googleSearch` (Google 搜索增强)。

## 2. 系统指令集 (System Instruction)
模型被赋予“世界级音乐识别专家”身份，执行以下多步验证逻辑：
1. 监听音频片段（人声、旋律、乐器）。
2. 转录听到的歌词文本。
3. 利用 Google 搜索确认曲名、艺术家及官方歌词版本。
4. 检测整体氛围 (Mood)。

## 3. 结构化输出控制 (JSON Schema)
强制要求模型返回以下结构的 JSON 对象：
```json
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string (4-6 lines, no timestamps)",
  "mood": "string (1-2 words)",
  "identified": "boolean"
}
```

## 4. 识别流程规范
- **采样:** 录制 5 秒 `audio/webm` 片段。
- **频率:** 每 45 秒自动触发一次，或检测到切歌（指纹不匹配）时触发。
- **地域偏移:** 将 `region` 参数注入提示词，优化特定市场（如 CN, JP）的搜索权重。