
# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **指令系统:** `SystemInstruction` 强制要求返回 JSON。

## 2. 结构化输出 (Response Schema)
AI 必须返回格式如下的 JSON：
```typescript
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string",
  "mood": "string",
  "identified": "boolean"
}
```

## 3. 歌曲识别与解析流程
1. **采样:** 录制 5-7 秒 WebM 片段。
2. **AI 请求:** 发送音频 Base64 数据。
3. **鲁棒性解析 (Robust Parsing):** 
   - **边界提取:** 采用边界搜索算法（`indexOf('{')` 与 `lastIndexOf('}')`）从 AI 返回的完整字符串中精准截取 JSON 块。
   - **容错处理:** 丢弃所有非 JSON 的前导符或 Markdown 代码块标识，确保 `JSON.parse` 成功率。
4. **重试机制:** 若请求失败或 JSON 解析异常，系统将自动触发一次重试（Max Retries: 1）。
5. **本地匹配:** 两次请求均失败后，回退至声学指纹库进行本地检索。
