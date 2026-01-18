
import React, { memo } from 'react';
import { TooltipArea } from './Tooltip'; // Assuming Tooltip is in the same directory

interface SettingsToggleProps {
  label: string; 
  value: boolean; 
  onChange: () => void; 
  activeColor?: string; 
  hintText?: string; 
  statusText?: string; 
  children?: React.ReactNode; 
  variant?: 'default' | 'clean';
}

export const SettingsToggle = memo(({ label, value, onChange, activeColor = 'blue', hintText, statusText, children, variant = 'default' }: SettingsToggleProps) => {
  const activeBg = activeColor === 'green' ? 'bg-green-500' : 'bg-blue-600';
  
  const containerClasses = variant === 'clean' 
    ? 'py-3 flex flex-col group'
    : 'bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors';
    
  const headerClasses = variant === 'clean'
    ? 'flex items-center justify-between w-full' 
    : 'flex items-center justify-between min-h-[24px] w-full';

  return (
    <div className={containerClasses}> 
      <div className={headerClasses}>
        <TooltipArea text={hintText}>
          <span className={`text-xs font-bold leading-none transition-colors ${variant === 'clean' ? 'text-white/60 group-hover:text-white' : 'text-white/70'}`}>{label}</span>
        </TooltipArea>
        <button 
          onClick={onChange} 
          className={`relative w-9 h-5 rounded-full transition-all duration-200 ease-in-out focus:outline-none flex items-center shrink-0 ${value ? activeBg : 'bg-white/10'}`}
          role="switch" 
          aria-checked={value}
          aria-label={label}
        >
          <span className={`inline-block w-3 h-3 transform transition-transform duration-200 ease-in-out bg-white rounded-full ${value ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      {statusText && <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest text-right mt-1">{statusText}</div>}
      {value && children && <div className="mt-3 pt-3 border-t border-white/5 animate-fade-in-up w-full">{children}</div>}
    </div>
  );
});
