
import React, { memo } from 'react';
import { TooltipArea } from './Tooltip'; // Assuming Tooltip is in the same directory

interface SteppedSliderProps {
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step: number; 
    onChange: (val: number) => void; 
    options?: {value: number, label: string}[]; 
    hintText?: string;
}

export const SteppedSlider = memo(({ label, value, min, max, step, onChange, options, hintText }: SteppedSliderProps) => {
    const isDiscrete = options && options.length > 1;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newVal = parseFloat(e.target.value);
        if (isDiscrete && options) {
            const closest = options.reduce((prev, curr) => 
                Math.abs(curr.value - newVal) < Math.abs(prev.value - newVal) ? curr : prev
            );
            newVal = closest.value;
        }
        onChange(newVal);
    };

    let displayLabel = value.toString();
    if (options) {
        const match = options.find(o => o.value === value);
        if (match) displayLabel = match.label;
        else if (!isDiscrete && options.length === 1) displayLabel = options[0].label;
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <TooltipArea text={hintText}>
                    <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] ml-1">{label}</span>
                </TooltipArea>
                <span className="text-[10px] font-mono text-white/80">{displayLabel}</span>
            </div>
            <div className="relative flex items-center h-6 w-full group">
                <input 
                    type="range" 
                    min={min} max={max} step={step} 
                    value={value} 
                    onChange={handleChange} 
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                    aria-label={label}
                />
                 <div className="w-full h-1.5 bg-white/10 rounded-lg overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
                </div>
                {isDiscrete && options && (
                    <div className="absolute w-full h-full pointer-events-none flex justify-between px-1">
                        {options.map(o => (
                            <div key={o.value} className={`w-0.5 h-1.5 mt-0.5 rounded-full ${o.value <= value ? 'bg-white/50' : 'bg-white/10'}`} style={{ left: `${((o.value - min) / (max - min)) * 100}%`, position: 'absolute' }} />
                        ))}
                    </div>
                )}
                 <div className="absolute h-3 w-3 bg-white rounded-full shadow-lg transform -translate-x-1.5 pointer-events-none transition-all group-hover:scale-125 z-10" style={{ left: `${((value - min) / (max - min)) * 100}%` }} />
            </div>
        </div>
    );
});
