
import { SongInfo } from '../types';

const STORAGE_KEY = 'av_fingerprints_v1';
const MAX_CACHE_SIZE = 50;
const SIMILARITY_THRESHOLD = 0.25;

interface FingerprintEntry {
  features: number[]; 
  song: SongInfo;
  timestamp: number;
}

export const generateFingerprint = async (base64Audio: string): Promise<number[]> => {
  let audioCtx: AudioContext | null = null;
  try {
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const arrayBuffer = bytes.buffer;

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;

    source.connect(analyser);
    source.connect(offlineCtx.destination);

    const features: Set<number> = new Set();
    const sliceDuration = 0.2;
    const totalDuration = audioBuffer.duration;

    source.start(0);

    for (let t = 0; t < totalDuration; t += sliceDuration) {
      offlineCtx.suspend(t).then(() => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        let maxVal = 0;
        let maxIndex = -1;
        for (let i = 2; i < 100; i++) {
            if (data[i] > maxVal) {
                maxVal = data[i];
                maxIndex = i;
            }
        }
        if (maxVal > 50 && maxIndex !== -1) {
             features.add(maxIndex); 
        }
      });
    }

    await offlineCtx.startRendering();
    return Array.from(features);
  } catch (e) {
    console.error("Fingerprint generation failed", e);
    return [];
  } finally {
    if (audioCtx) {
        try { await audioCtx.close(); } catch (e) {}
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
