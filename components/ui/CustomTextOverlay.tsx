
import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../../core/types';

interface CustomTextOverlayProps {
  settings: VisualizerSettings;
  analyser: AnalyserNode | null;
}

const CustomTextOverlay: React.FC<CustomTextOverlayProps> = ({ settings, analyser }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const sizeVw = settings.customTextSize || 12;
  const sizePx = sizeVw * 13;

  useEffect(() => {
    if (!settings.showCustomText || !settings.customText) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    const animate = () => {
      const baseOpacity = settings.customTextOpacity !== undefined ? settings.customTextOpacity : 1.0;
      if (textRef.current && analyser && settings.textPulse) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let bass = 0;
        for (let i = 0; i < 10; i++) bass += dataArray[i];
        bass = (bass / 10) / 255;
        const scale = 1 + (bass * 0.5 * settings.sensitivity);
        const rotation = settings.customTextRotation || 0;
        textRef.current.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        textRef.current.style.opacity = `${(0.6 + bass * 0.4) * baseOpacity}`;
      } else if (textRef.current) {
        const rotation = settings.customTextRotation || 0;
        textRef.current.style.transform = `rotate(${rotation}deg) scale(1)`;
        textRef.current.style.opacity = `${0.9 * baseOpacity}`;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [settings.showCustomText, settings.customText, settings.textPulse, settings.sensitivity, settings.customTextRotation, settings.customTextOpacity, analyser]);

  if (!settings.showCustomText || !settings.customText) return null;

  return (
    <div className="pointer-events-none fixed top-1/2 left-1/2 z-[100] w-full text-center flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
      <div ref={textRef} className="font-black tracking-widest uppercase transition-transform duration-75 ease-out select-none inline-block origin-center"
        style={{ 
            color: settings.customTextColor || '#ffffff',
            fontSize: `min(${sizeVw}vw, ${sizePx}px)`, 
            whiteSpace: 'pre-wrap', lineHeight: 1.1,
            fontFamily: settings.customTextFont || 'Inter, sans-serif'
        }}
      >
        {settings.customText}
      </div>
    </div>
  );
};

export default CustomTextOverlay;
