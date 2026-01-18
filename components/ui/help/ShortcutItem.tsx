
import React from 'react';

interface ShortcutItemProps { 
  label: string; 
  k: string;
}

export const ShortcutItem = ({ label, k }: ShortcutItemProps) => (
  <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
     <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors truncate pr-2 font-bold uppercase tracking-wider">{label}</span>
     <kbd className="text-xs font-mono bg-white/10 px-3 py-1 rounded-lg text-white border border-white/10 min-w-[24px] text-center shadow-md">{k}</kbd>
  </div>
);
