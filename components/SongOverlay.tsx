import React from 'react';
import { SongInfo, LyricsStyle } from '../types';

interface SongOverlayProps {
  song: SongInfo | null;
  lyricsStyle: LyricsStyle;
  showLyrics: boolean;
}

const SongOverlay: React.FC<SongOverlayProps> = ({ song, lyricsStyle, showLyrics }) => {
  // If lyrics are hidden or no song is identified, hide the entire overlay
  if (!showLyrics || !song || !song.identified) return null;

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

        {song.searchUrl && (
          <div className="mt-2 pointer-events-auto">
             <a href={song.searchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/50 hover:text-blue-300 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
               </svg>
               <span>Source (Google)</span>
             </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongOverlay;