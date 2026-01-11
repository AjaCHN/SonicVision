import React from 'react';
import { SongInfo, LyricsStyle } from '../types';

interface SongOverlayProps {
  song: SongInfo | null;
  lyricsStyle: LyricsStyle;
  showLyrics: boolean;
}

const SongOverlay: React.FC<SongOverlayProps> = ({ song, lyricsStyle, showLyrics }) => {
  if (!song || !song.identified) return null;

  const getLyricsClass = () => {
    switch (lyricsStyle) {
      case LyricsStyle.KARAOKE:
        return "text-3xl md:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
      case LyricsStyle.MINIMAL:
        return "text-lg font-light tracking-widest uppercase opacity-90 text-white drop-shadow-md";
      case LyricsStyle.NEON:
        return "text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] [text-shadow:_0_0_10px_#fff,_0_0_20px_#f0f,_0_0_30px_#0ff]";
      case LyricsStyle.GLITCH:
        return "text-2xl md:text-4xl font-mono font-bold text-green-400 tracking-tighter drop-shadow-[2px_2px_0_rgba(255,0,0,0.5)]";
      case LyricsStyle.TYPEWRITER:
        return "text-xl md:text-2xl font-mono text-yellow-100 bg-black/70 px-6 py-4 border-l-4 border-yellow-500 shadow-lg leading-relaxed";
      default: // STANDARD
        return "text-2xl md:text-3xl font-serif italic text-white/95 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
    }
  };

  const getContainerPosition = () => {
      switch (lyricsStyle) {
          case LyricsStyle.MINIMAL:
             return "bottom-36 right-8 text-right max-w-sm";
          case LyricsStyle.TYPEWRITER:
             return "bottom-40 left-8 md:left-20 text-left max-w-2xl";
          default: 
             return "top-1/3 left-0 right-0 text-center max-w-3xl mx-auto px-4";
      }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {/* Song Info Badge */}
      <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md border-l-4 border-blue-500 pl-4 py-3 rounded-r-xl max-w-xs md:max-w-md transition-all duration-700 transform translate-y-0 opacity-100 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <h2 className="text-white font-bold text-xl md:text-2xl truncate tracking-tight">{song.title}</h2>
        <p className="text-blue-300 text-sm md:text-base truncate font-medium">{song.artist}</p>
        
        {song.mood && (
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
               </svg>
               <span className="text-[10px] font-bold uppercase tracking-wider text-purple-100/90">
                 {song.mood}
               </span>
            </div>
          </div>
        )}
      </div>

      {/* Lyrics Display */}
      {showLyrics && (
        <div className={`absolute ${getContainerPosition()} transition-all duration-500 flex justify-center`}>
           <div className={`
              whitespace-pre-wrap py-6 px-8 rounded-3xl transition-all duration-500
              ${lyricsStyle === LyricsStyle.STANDARD || lyricsStyle === LyricsStyle.NEON ? 'bg-black/20 backdrop-blur-[2px]' : ''}
              ${getLyricsClass()}
           `}>
             {song.lyricsSnippet || (song.identified ? "..." : "")}
           </div>
        </div>
      )}
    </div>
  );
};

export default SongOverlay;