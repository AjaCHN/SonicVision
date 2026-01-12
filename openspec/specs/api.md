# SonicVision API 文档

## 目录

- [概述](#概述)
- [Google Gemini API](#google-gemini-api)
  - [API 描述](#api-描述)
  - [认证方式](#认证方式)
  - [调用示例](#调用示例)
  - [参数说明](#参数说明)
  - [响应格式](#响应格式)
  - [错误处理](#错误处理)
- [Web Audio API](#web-audio-api)
  - [API 描述](#api-描述-1)
  - [调用示例](#调用示例-1)
  - [参数说明](#参数说明-1)
- [MediaRecorder API](#mediarecorder-api)
  - [API 描述](#api-描述-2)
  - [调用示例](#调用示例-2)
  - [参数说明](#参数说明-2)
- [浏览器兼容性](#浏览器兼容性)
- [API 调用限制](#api-调用限制)

## 概述

SonicVision 项目使用以下外部 API：

1. **Google Gemini API**：用于歌曲识别
2. **Web Audio API**：用于音频捕获和分析
3. **MediaRecorder API**：用于录制音频片段

本文档详细描述这些 API 的使用方法、参数说明和最佳实践。

## Google Gemini API

### API 描述

Google Gemini API 是 Google 提供的生成式 AI 服务，SonicVision 使用其音频识别能力来识别正在播放的歌曲。

### 认证方式

使用 API 密钥进行认证。API 密钥应存储在安全的环境变量中，避免硬编码在客户端代码中。

### 调用示例

```typescript
import { GoogleGenerativeAI } from '@google/genai';
import { SongInfo, Language, Region } from '../../types';

// 从环境变量获取 API 密钥
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const identifySongFromAudio = async (
  audioBase64: string,
  mimeType: string,
  language: Language,
  region: Region
): Promise<SongInfo | null> => {
  try {
    // 初始化 Gemini 客户端
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // 构建提示词
    const prompt = `Identify this song from the audio. Return only the following information:\n` +
      `Title: [song title]\n` +
      `Artist: [artist name]\n` +
      `Lyrics: [short lyrics snippet]\n` +
      `Mood: [song mood]`;
    
    // 发送音频数据进行识别
    const result = await model.generateContent([
      prompt,
      { 
        inlineData: {
          data: audioBase64,
          mimeType 
        }
      }
    ]);
    
    // 解析响应
    const response = result.response;
    const text = response.text();
    
    // 提取歌曲信息
    const songInfo = parseSongInfo(text);
    return songInfo;
  } catch (error) {
    console.error("Error identifying song:", error);
    return null;
  }
};

// 解析歌曲信息
const parseSongInfo = (text: string): SongInfo => {
  const lines = text.split('\n');
  const info: Partial<SongInfo> = {};
  
  lines.forEach(line => {
    if (line.startsWith('Title:')) {
      info.title = line.substring(6).trim();
    } else if (line.startsWith('Artist:')) {
      info.artist = line.substring(7).trim();
    } else if (line.startsWith('Lyrics:')) {
      info.lyricsSnippet = line.substring(7).trim();
    } else if (line.startsWith('Mood:')) {
      info.mood = line.substring(5).trim();
    }
  });
  
  // 构建搜索 URL
  if (info.title && info.artist) {
    const query = `${info.artist} ${info.title}`;
    info.searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  
  return {
    title: info.title || 'Unknown',
    artist: info.artist || 'Unknown',
    lyricsSnippet: info.lyricsSnippet,
    mood: info.mood,
    identified: !!(info.title && info.artist),
    searchUrl: info.searchUrl,
    matchSource: 'AI'
  };
};
```

### 参数说明

| 参数 | 类型 | 描述 |
|------|------|------|
| audioBase64 | string | 音频数据的 Base64 编码字符串 |
| mimeType | string | 音频的 MIME 类型，如 'audio/webm' |
| language | Language | 界面语言，影响识别结果的语言 |
| region | Region | 地区设置，影响识别结果的区域相关性 |

### 响应格式

API 返回的原始响应是一个文本字符串，格式如下：

```
Title: Song Title
Artist: Artist Name
Lyrics: Short lyrics snippet
Mood: Song mood
```

解析后的 `SongInfo` 对象格式如下：

```typescript
interface SongInfo {
  title: string;
  artist: string;
  lyricsSnippet?: string;
  mood?: string;
  identified: boolean;
  searchUrl?: string;
  matchSource?: 'AI' | 'LOCAL';
}
```

### 错误处理

| 错误类型 | 错误代码 | 描述 | 处理方式 |
|----------|----------|------|----------|
| API_KEY 未定义 | - | 未设置 API 密钥 | 显示错误提示，引导用户设置 API 密钥 |
| 网络错误 | 408, 429, 500, 502, 503, 504 | 无法连接到 API 服务器 | 实现指数退避重试策略，最多重试 3 次，显示网络错误提示 |
| API 限制 | 429 | 超出 API 调用限制 | 显示限制提示，建议稍后再试，实现调用频率限制 |
| 识别失败 | - | API 无法识别歌曲 | 显示识别失败提示，允许用户手动重试 |
| 无效请求 | 400 | 请求参数无效 | 验证输入参数，确保音频数据格式正确 |
| 未授权 | 401 | API 密钥无效 | 检查 API 密钥是否正确，引导用户更新 API 密钥 |
| 禁止访问 | 403 | API 密钥权限不足 | 检查 API 密钥权限，确保包含音频识别权限 |

### 最佳实践

1. **API 密钥管理**：始终从环境变量加载 API 密钥，避免硬编码
2. **调用频率限制**：实现智能调度，避免频繁调用 API，建议间隔至少 10 秒
3. **音频质量**：使用 128kbps 的比特率，平衡质量和文件大小
4. **错误处理**：实现全面的错误处理，包括网络错误、API 限制等
5. **重试策略**：对网络错误实现指数退避重试策略，最多重试 3 次
6. **响应缓存**：缓存识别结果，避免短时间内重复识别同一首歌

## Web Audio API

### API 描述

Web Audio API 提供了在浏览器中处理音频的能力，SonicVision 使用它来捕获麦克风输入并分析音频频率数据。

### 调用示例

```typescript
// 请求麦克风权限并获取音频流
const startAudio = async (deviceId?: string) => {
  try {
    const constraints: MediaStreamConstraints = {
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
        channelCount: 2
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();

    const src = ctx.createMediaStreamSource(stream);
    const ana = ctx.createAnalyser();
    ana.fftSize = 2048;
    ana.smoothingTimeConstant = 0.85;
    src.connect(ana);
    
    // 开始分析音频数据
    const bufferLength = ana.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      requestAnimationFrame(updateVisualization);
      ana.getByteFrequencyData(dataArray);
      // 使用 dataArray 驱动可视化效果
    };
    
    updateVisualization();
    
    return { stream, ctx, ana };
  } catch (err) {
    console.error("Error accessing microphone:", err);
    throw err;
  }
};
```

### 参数说明

| 参数 | 类型 | 默认值 | 范围 | 描述 |
|------|------|--------|------|------|
| deviceId | string (可选) | undefined | - | 音频输入设备的 ID，不提供则使用默认设备 |
| echoCancellation | boolean | false | true/false | 是否启用回声消除，建议关闭以获得更准确的音频数据 |
| autoGainControl | boolean | false | true/false | 是否启用自动增益控制，建议关闭以获得更准确的音频数据 |
| noiseSuppression | boolean | false | true/false | 是否启用噪声抑制，建议关闭以获得更准确的音频数据 |
| channelCount | number | 2 | 1-2 | 音频通道数，建议使用 2 通道以获得立体声效果 |
| fftSize | number | 2048 | 32-32768 | FFT 大小，影响频率分析的精度，值越大精度越高但性能消耗越大 |
| smoothingTimeConstant | number | 0.85 | 0.0-1.0 | 平滑时间常数，影响频率数据的平滑度，值越大数据越平滑但响应越慢 |

### 错误处理

| 错误类型 | 描述 | 处理方式 |
|----------|------|----------|
| 权限被拒绝 | 用户拒绝麦克风访问权限 | 显示错误提示，引导用户在浏览器设置中授予权限 |
| 无可用设备 | 没有可用的音频输入设备 | 显示错误提示，建议用户连接麦克风 |
| 设备不可用 | 音频设备被其他应用占用 | 显示错误提示，建议用户关闭其他使用麦克风的应用 |
| 初始化失败 | AudioContext 初始化失败 | 检查浏览器兼容性，显示错误提示 |
| 资源不足 | 系统资源不足 | 降低 fftSize 值，减少性能消耗 |

### 最佳实践

1. **权限管理**：明确请求用户权限，不自动获取
2. **设备选择**：提供音频设备选择功能，允许用户选择合适的设备
3. **参数优化**：根据设备性能调整 fftSize 和 smoothingTimeConstant
4. **资源管理**：正确释放音频资源，避免内存泄漏
5. **错误处理**：实现全面的错误处理，包括权限错误、设备错误等
6. **性能优化**：在低性能设备上降低 fftSize 值，提高性能

## MediaRecorder API

### API 描述

MediaRecorder API 提供了在浏览器中录制媒体的能力，SonicVision 使用它来录制音频片段用于歌曲识别。

### 调用示例

```typescript
// 设置音频录制器
const setupRecorder = (stream: MediaStream) => {
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
    ? 'audio/webm;codecs=opus' 
    : 'audio/webm';

  const options: MediaRecorderOptions = {
     mimeType,
     audioBitsPerSecond: 128000
  };
  
  try {
    const rec = new MediaRecorder(stream, options);
    const chunks: BlobPart[] = [];
    
    rec.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    });
    
    rec.addEventListener('stop', async () => {
      const blob = new Blob(chunks, { type: mimeType });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const resultStr = reader.result as string;
        if (resultStr) {
          const base64 = resultStr.split(',')[1];
          // 使用 base64 音频数据进行歌曲识别
          const songInfo = await identifySongFromAudio(base64, mimeType, language, region);
          // 处理识别结果
        }
      };
      
      reader.readAsDataURL(blob);
    });
    
    // 开始录制，10秒后停止
    rec.start();
    setTimeout(() => {
      if (rec.state === 'recording') rec.stop();
    }, 10000);
    
    return rec;
  } catch (e) {
    console.error("MediaRecorder init failed", e);
    throw e;
  }
};
```

### 参数说明

| 参数 | 类型 | 默认值 | 范围 | 描述 |
|------|------|--------|------|------|
| stream | MediaStream | - | - | 要录制的媒体流，通常是从 getUserMedia 获取的音频流 |
| mimeType | string | 'audio/webm;codecs=opus' | - | 录制的 MIME 类型，优先使用支持的格式 |
| audioBitsPerSecond | number | 128000 | 8000-384000 | 音频比特率，影响音频质量和文件大小，建议使用 128000 |
| videoBitsPerSecond | number | - | - | 视频比特率，MediaRecorder 也支持视频录制 |
| bitsPerSecond | number | - | - | 总比特率，包括音频和视频 |

### 错误处理

| 错误类型 | 描述 | 处理方式 |
|----------|------|----------|
| 不支持的 MIME 类型 | 浏览器不支持指定的 MIME 类型 | 降级使用其他支持的 MIME 类型 |
| 录制失败 | 录制过程中发生错误 | 显示错误提示，允许用户重试 |
| 设备断开 | 音频设备在录制过程中断开 | 显示错误提示，引导用户重新连接设备 |
| 文件过大 | 录制的文件超过预期大小 | 限制录制时间，避免生成过大的文件 |
| 内存不足 | 系统内存不足 | 减少录制时间或降低比特率 |

### 最佳实践

1. **格式检测**：使用 MediaRecorder.isTypeSupported() 检测浏览器支持的格式
2. **比特率选择**：使用 128kbps 的比特率，平衡质量和文件大小
3. **录制时间**：控制录制时间在 8-12 秒之间，确保识别效果的同时避免文件过大
4. **错误处理**：实现全面的错误处理，包括格式错误、设备错误等
5. **资源管理**：正确释放 MediaRecorder 实例，避免内存泄漏
6. **兼容性处理**：针对不同浏览器实现不同的录制策略

## 浏览器兼容性

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| Google Gemini API | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder API | ✅ | ✅ | ✅ | ✅ |

## API 调用限制

### Google Gemini API 限制

- **请求频率**：避免过于频繁的 API 调用，建议间隔至少 10 秒
- **音频长度**：录制的音频片段应控制在 8-12 秒之间
- **音频质量**：使用适当的比特率（如 128kbps），平衡质量和文件大小
- **错误重试**：实现指数退避重试策略，避免在 API 错误时立即重试

### Web Audio API 限制

- **权限**：需要用户明确授权麦克风访问权限
- **性能**：调整 fftSize 和 smoothingTimeConstant 以平衡性能和视觉效果
- **资源管理**：正确释放音频资源，避免内存泄漏

### MediaRecorder API 限制

- **格式支持**：不同浏览器支持的音频格式可能不同，需要做兼容性处理
- **录制时间**：控制录制时间，避免生成过大的文件
- **错误处理**：处理录制过程中可能出现的错误，如设备断开连接