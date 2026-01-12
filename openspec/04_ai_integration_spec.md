# OpenSpec: AI 集成规范

## 1. 模型与工具配置
- **模型:** `gemini-3-flash-preview`。
- **工具:** `googleSearch`（用于实时验证歌曲元数据）。
- **指令系统:** `SystemInstruction` 定义专家身份，强制多步骤验证逻辑。

## 2. 结构化输出 (Response Schema)
AI 必须返回严格的 JSON 格式：
```typescript
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string (4-6 lines)",
  "mood": "string",
  "identified": "boolean"
}
```

## 3. 歌曲识别流程
1. **采样:** 录制 5 秒 WebM 片段。
2. **并发校验:** 同时向 AI 发送音频数据与识别指令。
3. **数据增强:** 从 `groundingMetadata` 中提取搜索源 URL。
4. **回退逻辑:** 失败时启动指纹库本地匹配。
