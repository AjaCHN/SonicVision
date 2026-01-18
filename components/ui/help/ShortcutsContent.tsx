
import React from 'react';
import { ShortcutItem } from './ShortcutItem'; // Assuming ShortcutItem is in the same directory

interface ShortcutsContentProps { 
  h: any; 
  s: any; // shortcutItems from translation
}

export const ShortcutsContent: React.FC<ShortcutsContentProps> = ({ h, s }) => (
    <div>
        <h4 className="text-sm font-black text-orange-400 uppercase tracking-[0.2em] mb-4 px-1">{h?.shortcutsTitle || "Keyboard Shortcuts"}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShortcutItem label={s?.toggleMic || "Mic"} k="Space" />
            <ShortcutItem label={s?.fullscreen || "Fullscreen"} k="F" />
            <ShortcutItem label={s?.lyrics || "AI Info"} k="L" />
            <ShortcutItem label={s?.hideUi || "Toggle UI"} k="H" />
            <ShortcutItem label={s?.randomize || "Randomize"} k="R" />
            <ShortcutItem label={s?.glow || "Glow"} k="G" />
            <ShortcutItem label={s?.trails || "Trails"} k="T" />
            <ShortcutItem label={s?.changeMode || "Cycle Mode"} k="← →" />
        </div>
    </div>
);
