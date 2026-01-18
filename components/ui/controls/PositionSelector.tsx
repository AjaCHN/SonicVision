
import React, { memo } from 'react';
import { Position } from '../../../core/types';

interface PositionSelectorProps {
  label: string; 
  value: Position; 
  onChange: (value: Position) => void; 
  options: { value: string; label: string }[]; 
  activeColor?: 'blue' | 'green';
}

export const PositionSelector = memo(({ label, value, onChange, options, activeColor = 'blue' }: PositionSelectorProps) => {
  const activeBgClass = activeColor === 'blue' ? 'bg-blue-600' : 'bg-green-600';
  return (
    <div className="space-y-3" role="radiogroup" aria-label={label}>
      {label && <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ml-1">{label}</span>}
      <div className="grid grid-cols-3 gap-1 bg-white/[0.02] p-2 rounded-xl max-w-[160px]">
        {options.map(pos => (
          <button key={pos.value} onClick={() => onChange(pos.value as Position)} title={pos.label} aria-label={pos.label} role="radio" aria-checked={value === pos.value}
            className={`aspect-[4/3] rounded flex items-center justify-center transition-all ${value === pos.value ? `${activeBgClass} text-white shadow-lg` : 'bg-white/5 text-white/20 hover:text-white/40'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${value === pos.value ? 'bg-white' : 'bg-white/20'}`} />
          </button>
        ))}
      </div>
    </div>
  );
});
