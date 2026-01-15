
import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';

interface CustomTextOverlayProps {
  settings: VisualizerSettings;
  analyser: AnalyserNode | null;
}

const CustomTextOverlay: React.FC<CustomTextOverlayProps> = ({ settings, analyser }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef(0);
  const lastTimeRef = useRef(0);
  const sizeVw = settings.customTextSize || 12;
  const sizePx = sizeVw * 13; // Approximate conversion for max size

  useAudioPulse({
    elementRef: textRef,
    analyser,
    settings,
    isEnabled: settings.showCustomText && !!settings.customText && settings.textPulse,
    baseOpacity: settings.customTextOpacity,
  });
  
  // Effect to handle non-pulsing transformations (rotation and base opacity)
  useEffect(() => {
    if (textRef.current && settings.showCustomText && settings.customText) {
      const rotation = settings.customTextRotation || 0;
      textRef.current.style.transform = `rotate(${rotation}deg)`;
      if (!settings.textPulse) {
         textRef.current.style.opacity = `${0.9 * (settings.customTextOpacity || 1.0)}`;
      }
    }
  }, [settings.showCustomText, settings.customText, settings.customTextRotation, settings.customTextOpacity, settings.textPulse]);

  // Effect to handle Color Cycling
  useEffect(() => {
    let rafId: number;
    
    const animateColor = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (textRef.current && settings.customTextCycleColor) {
        // Full 360 degrees rotation over `interval` seconds
        // deltaHue = (deltaTime in ms / 1000) * (360 / interval)
        const interval = settings.customTextCycleInterval || 5; 
        const speed = 360 / Math.max(0.1, interval);
        const delta = (deltaTime / 1000) * speed;
        
        hueRef.current = (hueRef.current + delta) % 360;
        textRef.current.style.color = `hsl(${hueRef.current}, 100%, 65%)`;
        
        rafId = requestAnimationFrame(animateColor);
      }
    };

    if (settings.customTextCycleColor) {
      rafId = requestAnimationFrame(animateColor);
    } else if (textRef.current) {
      // If cycling is disabled, revert to static color or remove override
      // Setting explicit color ensures we don't get stuck on the last HSL value
      textRef.current.style.color = settings.customTextColor || '#ffffff';
      lastTimeRef.current = 0;
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lastTimeRef.current = 0;
    };
  }, [settings.customTextCycleColor, settings.customTextColor, settings.customTextCycleInterval]);


  if (!settings.showCustomText || !settings.customText) return null;

  const getPositionClasses = () => {
      const pos = settings.customTextPosition || 'mc';
      const map: Record<string, string> = {
          tl: 'top-8 left-8 text-left items-start',
          tc: 'top-8 left-1/2 -translate-x-1/2 text-center items-center',
          tr: 'top-8 right-8 text-right items-end',
          ml: 'top-1/2 left-8 -translate-y-1/2 text-left items-start',
          mc: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center',
          mr: 'top-1/2 right-8 -translate-y-1/2 text-right items-end',
          bl: 'bottom-8 left-8 text-left items-start',
          bc: 'bottom-8 left-1/2 -translate-x-1/2 text-center items-center',
          br: 'bottom-8 right-8 text-right items-end',
      };
      return map[pos] || map.mc;
  };

  return (
    <div className={`pointer-events-none fixed z-[100] flex flex-col ${getPositionClasses()}`}>
      <div ref={textRef} className="font-black tracking-widest uppercase transition-transform duration-75 ease-out select-none inline-block origin-center break-words"
        style={{ 
            color: settings.customTextCycleColor ? undefined : (settings.customTextColor || '#ffffff'),
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
