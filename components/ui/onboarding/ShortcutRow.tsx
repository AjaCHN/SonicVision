
import React from 'react';

interface ShortcutRowProps { 
  k: string; 
  label: string;
}

export const ShortcutRow = ({ k, label }: ShortcutRowProps) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]"><span className="text-white/60 text-xs truncate mr-2">{label}</span><kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono text-white border border-white/10 min-w-[24px] text-center">{k}</kbd></div>
);
