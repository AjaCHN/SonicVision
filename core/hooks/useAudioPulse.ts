import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../types';

interface UseAudioPulseProps {
  elementRef: React.RefObject<HTMLElement | null>;
  analyser: AnalyserNode | null;
  settings: Pick<VisualizerSettings, 'sensitivity'>;
  isEnabled: boolean;
  pulseStrength?: number;
  opacityStrength?: number;
  baseOpacity?: number;
}

/**
 * 使用 CSS 变量应用音频响应式脉冲效果。
 * 这种方式避免了直接覆盖 transform 属性，从而允许组件独立维护旋转等其他变换。
 */
export const useAudioPulse = ({
  elementRef,
  analyser,
  settings,
  isEnabled,
  pulseStrength = 0.5,
  opacityStrength = 0.4,
  baseOpacity = 1.0,
}: UseAudioPulseProps) => {
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const cleanup = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const el = elementRef.current;
      if (el) {
        el.style.removeProperty('--pulse-scale');
        el.style.removeProperty('--pulse-opacity');
        el.style.willChange = 'auto';
      }
    };

    if (!isEnabled) {
      cleanup();
      return;
    }

    const el = elementRef.current;
    if (el) {
      el.style.willChange = 'transform, opacity';
      // 初始化默认值
      el.style.setProperty('--pulse-scale', '1');
      el.style.setProperty('--pulse-opacity', baseOpacity.toString());
    }

    const animate = () => {
      if (elementRef.current && analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let bass = 0;
        const bassBins = 10;
        for (let i = 0; i < bassBins; i++) bass += dataArray[i];
        const bassNormalized = (bass / bassBins) / 255;

        const scale = 1 + (bassNormalized * pulseStrength * settings.sensitivity);
        const opacity = Math.min(1, (1.0 - opacityStrength + bassNormalized * opacityStrength) * baseOpacity);

        elementRef.current.style.setProperty('--pulse-scale', scale.toFixed(3));
        elementRef.current.style.setProperty('--pulse-opacity', opacity.toFixed(3));
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return cleanup;
  }, [isEnabled, analyser, settings.sensitivity, pulseStrength, opacityStrength, baseOpacity, elementRef]);
};