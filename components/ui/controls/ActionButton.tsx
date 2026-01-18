
import React, { memo } from 'react';
import { TooltipArea } from './Tooltip'; // Assuming Tooltip is in the same directory

interface ActionButtonProps { 
  onClick: () => void; 
  hintText: string; 
  icon: React.ReactNode;
}

export const ActionButton = memo(({ onClick, hintText, icon }: ActionButtonProps) => (
  <TooltipArea text={hintText}>
    <button 
      onClick={onClick} 
      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 hover:border-white/20 flex items-center justify-center transition-all duration-300"
      aria-label={hintText}
    >
      {icon}
    </button>
  </TooltipArea>
));
