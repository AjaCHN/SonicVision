import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../types';
import { getAverage } from '../services/audioUtils';

interface UseAudioReactiveProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const useAudioReactive = ({ analyser, colors, settings }: UseAudioReactiveProps) => {
  const dataArray = useRef(new Uint8Array(analyser.frequencyBinCount)).current;
  
  const smoothedColors = useRef(colors.map(c => new THREE.Color(c))).current;
  const targetColor = useRef(new THREE.Color());

  const audioData = useRef({ bass: 0, mids: 0, treble: 0, volume: 0 }).current;

  useFrame(() => {
    // 1. Smooth Color Transition Logic
    const lerpSpeed = 0.05;
    if (smoothedColors.length !== colors.length) {
        // Handle theme color array size change
        const lastValid = smoothedColors[0] || targetColor.current.set(colors[0]);
        const newArr = new Array(colors.length).fill(lastValid);
        smoothedColors.forEach((c, i) => { if (i < newArr.length) newArr[i] = c; });
        smoothedColors.length = 0;
        Array.prototype.push.apply(smoothedColors, newArr);
    }
    smoothedColors.forEach((color, i) => {
      color.lerp(targetColor.current.set(colors[i] || colors[0] || '#ffffff'), lerpSpeed);
    });

    // 2. Audio Data Processing
    analyser.getByteFrequencyData(dataArray);
    audioData.bass = getAverage(dataArray, 0, 15) / 255 * settings.sensitivity;
    audioData.mids = getAverage(dataArray, 20, 80) / 255 * settings.sensitivity;
    audioData.treble = getAverage(dataArray, 100, 160) / 255 * settings.sensitivity;
    audioData.volume = getAverage(dataArray, 0, dataArray.length) / 255;
  });

  return { ...audioData, smoothedColors };
};
