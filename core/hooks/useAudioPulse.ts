import { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../types';

interface UseAudioPulseProps {
  elementRef: React.RefObject<HTMLElement>;
  analyser: AnalyserNode | null;
  settings: Pick<VisualizerSettings, 'sensitivity'>;
  isEnabled: boolean;
  pulseStrength?: number;
  opacityStrength?: number;
  baseOpacity?: number;
}

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
    if (!isEnabled) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (elementRef.current) {
        // Reset styles when disabled
        elementRef.current.style.transform = '';
        elementRef.current.style.opacity = `${baseOpacity}`;
      }
      return;
    }

    const animate = () => {
      if (elementRef.current && analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let bass = 0;
        for (let i = 0; i < 10; i++) bass += dataArray[i];
        const bassNormalized = (bass / 10) / 255;

        const scale = 1 + (bassNormalized * pulseStrength * settings.sensitivity);
        const opacity = Math.min(1, (1.0 - opacityStrength + bassNormalized * opacityStrength) * baseOpacity);

        // Directly apply styles, allowing other transform properties to be preserved
        const existingTransform = elementRef.current.style.transform.replace(/scale\([^)]*\)/, '').trim();
        elementRef.current.style.transform = `${existingTransform} scale(${scale})`;
        elementRef.current.style.opacity = `${opacity}`;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isEnabled, analyser, settings.sensitivity, pulseStrength, opacityStrength, baseOpacity, elementRef]);
};
