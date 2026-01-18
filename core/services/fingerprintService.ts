import { SongInfo } from '../types';

const STORAGE_KEY = 'av_fingerprints_v1';
const MAX_CACHE_SIZE = 50;
const SIMILARITY_THRESHOLD = 0.25;

interface FingerprintEntry {
  features: number[]; 
  song: SongInfo;
  timestamp: number;
}

/**
 * 核心修复：重构 generateFingerprint 以正确使用 OfflineAudioContext 捕获 FFT 数据。
 * 之前的方法通过 suspend 和 then 尝试获取 FFT 数据是错误的，FFT 数据必须在音频处理过程中捕获。
 * 
 * 此版本使用 ScriptProcessorNode 在 OfflineAudioContext 渲染时捕获 FFT 数据。
 * (ScriptProcessorNode 在主线程已弃用，但在 OfflineAudioContext 中仍是常见且有效的方式)。
 */
export const generateFingerprint = async (base64Audio: string): Promise<number[]> => {
  let audioCtx: AudioContext | null = null;
  let offlineCtx: OfflineAudioContext | null = null;

  try {
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const arrayBuffer = bytes.buffer;

    // 使用标准 AudioContext 解码音频，因为 OfflineAudioContext 的 decodeAudioData 可能会有问题或被弃用
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // 创建 OfflineAudioContext 用于离线处理
    // 使用与原始音频相同的采样率和声道数
    offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineCtx.createAnalyser();
    analyser.fftSize = 1024; // 与 spec/audio_engine_spec.md 中的 FFT size 保持一致
    analyser.smoothingTimeConstant = 0; // 关闭平滑，获取原始频率数据

    // ScriptProcessorNode 用于在离线渲染过程中捕获数据
    // bufferSize 必须是 256, 512, 1024, 2048, 4096, 8192, 16384 中的一个
    const bufferSize = 2048; 
    const scriptProcessor = offlineCtx.createScriptProcessor(bufferSize, 1, 1);

    source.connect(analyser);
    analyser.connect(scriptProcessor); // 连接到 ScriptProcessorNode
    scriptProcessor.connect(offlineCtx.destination); // 必须连接到目的地
    source.start(0);

    const features: Set<number> = new Set();
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      analyser.getByteFrequencyData(freqData);
      let maxVal = 0;
      let maxIndex = -1;
      // 只扫描低频段（0-4300Hz 范围内的优势峰值索引），对应 FFT bin 0-100 左右
      // analyser.frequencyBinCount / (sampleRate / 2) * 4300Hz
      // 512 bins, 44100Hz -> bin corresponds to ~43Hz. 100 bins = 4300Hz
      const scanLimit = Math.min(freqData.length, 100); 

      for (let i = 2; i < scanLimit; i++) { // 忽略最低频段，避免直流分量干扰
        if (freqData[i] > maxVal) {
          maxVal = freqData[i];
          maxIndex = i;
        }
      }
      if (maxVal > 50 && maxIndex !== -1) { // 阈值避免噪音
        features.add(maxIndex);
      }
    };

    await offlineCtx.startRendering();
    
    // 清理 ScriptProcessorNode
    scriptProcessor.onaudioprocess = null;
    scriptProcessor.disconnect();

    return Array.from(features);

  } catch (e) {
    console.error("[Fingerprint] generation failed:", e);
    return [];
  } finally {
    // 修复：确保关闭 AudioContext，但 OfflineAudioContext 在渲染完成后会自动关闭
    if (audioCtx) {
      try { await audioCtx.close(); } catch (e) { console.warn("[Fingerprint] Error closing AudioContext:", e); }
    }
  }
};

export const saveToLocalCache = (features: number[], song: SongInfo) => {
  if (!features || features.length < 5) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let cache: FingerprintEntry[] = raw ? JSON.parse(raw) : [];
    const existingIndex = cache.findIndex(c => 
        c.song.title.toLowerCase() === song.title.toLowerCase() && 
        c.song.artist.toLowerCase() === song.artist.toLowerCase()
    );
    if (existingIndex >= 0) cache.splice(existingIndex, 1);
    const entry: FingerprintEntry = {
        features,
        song: { ...song, matchSource: 'LOCAL' },
        timestamp: Date.now()
    };
    cache.unshift(entry);
    if (cache.length > MAX_CACHE_SIZE) cache = cache.slice(0, MAX_CACHE_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Local storage save failed", e);
  }
};

export const findLocalMatch = (features: number[]): SongInfo | null => {
  if (!features || features.length < 5) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cache: FingerprintEntry[] = JSON.parse(raw);
    let bestMatch: SongInfo | null = null;
    let bestScore = 0;

    for (const entry of cache) {
       const score = calculateJaccardSimilarity(features, entry.features);
       if (score > bestScore) {
           bestScore = score;
           bestMatch = entry.song;
       }
    }
    return (bestScore >= SIMILARITY_THRESHOLD && bestMatch) ? bestMatch : null;
  } catch (e) {
    return null;
  }
};

function calculateJaccardSimilarity(arr1: number[], arr2: number[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    let intersection = 0;
    set1.forEach(val => { if (set2.has(val)) intersection++; });
    const union = set1.size + set2.size - intersection;
    return union === 0 ? 0 : intersection / union;
}