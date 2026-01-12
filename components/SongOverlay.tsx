
import React, { useEffect, useRef } from 'react';
import { SongInfo, LyricsStyle, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SongOverlayProps {
  song: SongInfo | null;
  lyricsStyle: LyricsStyle;
  showLyrics: boolean;
  language: Language;
  onRetry: () => void;
  onClose: () => void;
  analyser?: AnalyserNode | null;
  sensitivity?: number;
}

const SongOverlay: React.FC<SongOverlayProps> = ({ 
  song, 
  lyricsStyle, 
  showLyrics, 
  language, 
  onRetry, 
  onClose,
  analyser,
  sensitivity = 1.0
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !song || !song.identified || !showLyrics) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const pulseTitle = () => {
      if (!titleRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate bass intensity (first few bins)
      let bass = 0;
      const bassBins = 10;
      for (let i = 0; i < bassBins; i++) {
        bass += dataArray[i];
      }
      bass /= bassBins;
      
      // Map bass to a subtle scale factor (1.0 to 1.05)
      const intensity = (bass / 255) * sensitivity;
      const scale = 1 + (intensity * 0.05);
      
      titleRef.current.style.transform = `scale(${scale})`;
      
      requestRef.current = requestAnimationFrame(pulseTitle);
    };

    requestRef.current = requestAnimationFrame(pulseTitle);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, song, showLyrics, sensitivity]);

  // If lyrics are hidden or no song is identified, hide the entire overlay
  if (!showLyrics || !song || !song.identified) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {/* Song Info Badge */}
      <div className="absolute top-8 left-8 bg-black/40