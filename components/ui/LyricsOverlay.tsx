import React, { useRef } from 'react';
import { VisualizerSettings, SongInfo, LyricsStyle } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';

interface LyricsOverlayProps {
  settings: VisualizerSettings;
  song: SongInfo | null;
  showLyrics: boolean;
  lyricsStyle: LyricsStyle;
  analyser: AnalyserNode | null;
}

const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ settings, song, showLyrics, lyricsStyle, analyser }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isEnabled = showLyrics && !!song && (!!song.lyricsSnippet || song.identified);
  
  useAudioPulse({
    elementRef: containerRef,
    analyser,
    settings,
    isEnabled: !!isEnabled,
    pulseStrength: lyricsStyle === LyricsStyle.KARAOKE ? 0.45 : 0.2,
    opacityStrength: lyricsStyle === LyricsStyle.MINIMAL ? 0.3 : 0,
    baseOpacity: lyricsStyle === LyricsStyle.MINIMAL ? 0.7 : 1.0,
  });

  if (!isEnabled) return null;
  const text = (song.lyricsSnippet || "").replace(/\[\d{2}:\d{2}(\.\d{1,3})?\]/g, '').trim();
  if (!text) return null;
  const lines = text.split('\n').slice(0, 6);

  let textClass = "";
  let fontStyle: React.CSSProperties = {};
  if (lyricsStyle === LyricsStyle.KARAOKE) {
     textClass = "font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]";
     fontStyle = { fontFamily: '"Inter", sans-serif', fontSize: 'min(5vw, 48px)', lineHeight: 1.3 };
  } else if (lyricsStyle === LyricsStyle.MINIMAL) {
     textClass = "font-mono text-white/80 tracking-[0.2em]";
     fontStyle = { fontSize: 'min(2.5vw, 20px)', lineHeight: 1.8 };
  } else {
     textClass = "font-serif italic text-white drop-shadow-md";
     fontStyle = { fontSize: 'min(4vw, 36px)', lineHeight: 1.4 };
  }

  const getPositionClasses = () => {
      const pos = settings.lyricsPosition || 'mc';
      const map: Record<string, string> = {
          tl: 'top-24 left-8 text-left items-start',
          tc: 'top-24 left-1/2 -translate-x-1/2 text-center items-center',
          tr: 'top-24 right-8 text-right items-end',
          ml: 'top-1/2 left-8 -translate-y-1/2 text-left items-start',
          mc: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center',
          mr: 'top-1/2 right-8 -translate-y-1/2 text-right items-end',
          bl: 'bottom-32 left-8 text-left items-start',
          bc: 'bottom-32 left-1/2 -translate-x-1/2 text-center items-center',
          br: 'bottom-32 right-8 text-right items-end',
      };
      return map[pos] || map.mc;
  };

  return (
    <div className={`pointer-events-none fixed inset-0 z-10 flex flex-col px-6 ${getPositionClasses()}`}>
      <div ref={containerRef} className="transition-transform duration-75 ease-out select-none max-w-4xl">
         {lines.map((line, i) => <p key={i} className={textClass} style={fontStyle}>{line}</p>)}
      </div>
    </div>
  );
};

export default LyricsOverlay;
