import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../types';
import { getAverage } from '../services/audioUtils';
import { BeatDetector } from '../services/beatDetector';

interface UseAudioReactiveProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const useAudioReactive = ({ analyser, colors, settings }: UseAudioReactiveProps) => {
  const dataArray = useRef(new Uint8Array(analyser.frequencyBinCount)).current;
  
  const smoothedColorsRef = useRef(colors.map(c => new THREE.Color(c)));
  const targetColorRef = useRef(new THREE.Color());
  const beatDetectorRef = useRef(new BeatDetector());

  const audioData = useRef({ bass: 0, mids: 0, treble: 0, volume: 0, isBeat: false }).current;

  useFrame(() => {
    const smoothedColors = smoothedColorsRef.current;
    
    // 1. Smooth Color Transition Logic
    const lerpSpeed = 0.05;
    
    // BUG FIX: Correctly handle theme color array size change to prevent visual jumps.
    // If the target colors array has a different length, we need to adapt `smoothedColors`.
    if (smoothedColors.length !== colors.length) {
      const currentLength = smoothedColors.length;
      const targetLength = colors.length;

      if (currentLength < targetLength) {
        // Array is growing: pad with new THREE.Color instances.
        // We initialize new colors to match the target color immediately to prevent visual glitches.
        for (let i = currentLength; i < targetLength; i++) {
          smoothedColors.push(new THREE.Color(colors[i] || colors[0] || '#ffffff'));
        }
      } else {
        // Array is shrinking: truncate it.
        smoothedColors.length = targetLength;
      }
    }

    smoothedColors.forEach((color, i) => {
      // Ensure there's always a target color; fallback to the first or white if undefined.
      const targetHex = colors[i] || colors[0] || '#ffffff';
      color.lerp(targetColorRef.current.set(targetHex), lerpSpeed);
    });

    // 2. Audio Data Processing
    analyser.getByteFrequencyData(dataArray);
    
    audioData.isBeat = beatDetectorRef.current.detect(dataArray);
    
    audioData.bass = getAverage(dataArray, 0, 15) / 255 * settings.sensitivity;
    audioData.mids = getAverage(dataArray, 20, 80) / 255 * settings.sensitivity;
    audioData.treble = getAverage(dataArray, 100, 160) / 255 * settings.sensitivity;
    audioData.volume = getAverage(dataArray, 0, dataArray.length) / 255;
  });

  return { ...audioData, smoothedColors: smoothedColorsRef.current };
};