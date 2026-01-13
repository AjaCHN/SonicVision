
import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../types';

interface CustomTextOverlayProps {
  settings: VisualizerSettings;
  analyser: AnalyserNode | null;
}

const CustomTextOverlay: React.FC<CustomTextOverlayProps> = ({ settings, analyser }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.showCustomText || !settings.customText) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = () => {
      if (textRef.current && analyser && settings.textPulse) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate bass energy (first 10 bins)
        let bass = 0;
        for (let i = 0; i < 10; i++) {
          bass += dataArray[i];
        }
        bass = (bass / 10) / 255;

        // Scale based on bass and sensitivity
        const scale = 1 + (bass * 0.5 * settings.sensitivity);
        textRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        textRef.current.style.opacity = `${0.6 + bass * 0.4}`;
      } else if (textRef.current) {
        // Reset if pulse is disabled or no audio
        textRef.current.style.transform = `translate(-50%, -50%) scale(1)`;
        textRef.current.style.opacity = '0.9';
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [settings.showCustomText, settings.customText, settings.textPulse, settings.sensitivity, analyser]);

  if (!settings.showCustomText || !settings.customText) return null;

  return (
    <div 
      className="pointer-events-none fixed top-1/2 left-1/2 z-10 w-full text-center mix-blend-overlay"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div 
        ref={textRef} 
        className="text-white font-black tracking-widest uppercase transition-transform duration-75 ease-out select-none"
        style={{ 
            fontSize: 'min(12vw, 160px)', 
            textShadow: '0 0 40px rgba(255,255,255,0.3)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.1
        }}
      >
        {settings.customText}
      </div>
    </div>
  );
};

export default CustomTextOverlay;
