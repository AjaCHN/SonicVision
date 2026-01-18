
import React, { memo } from 'react';
import { TooltipArea } from './Tooltip'; // Assuming Tooltip is in the same directory

interface SliderProps {
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void; 
  unit?: string; 
  hintText?: string;
}

export const Slider = memo(({ label, value, min, max, step, onChange, unit = '', hintText }: SliderProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <TooltipArea text={hintText}>
        <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] ml-1">{label}</span>
      </TooltipArea>
      <span className="text-[10px] font-mono text-white/80">{value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit}</span>
    </div>
    <div className="group relative flex items-center h-6 w-full">
        <input 
            type="range" 
            min={min} max={max} step={step} 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="absolute w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={label}
        />
        <div className="w-full h-1.5 bg-white/10 rounded-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
        </div>
        <div className="absolute h-3 w-3 bg-white rounded-full shadow-lg transform -translate-x-1.5 pointer-events-none transition-all group-hover:scale-125" style={{ left: `${((value - min) / (max - min)) * 100}%` }} />
    </div>
  </div>
));
