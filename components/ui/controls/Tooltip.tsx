
import React, { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../AppContext';

interface FloatingTooltipProps {
  text: string | undefined | null;
  visible: boolean;
  anchorRef: React.RefObject<HTMLElement>;
}

const FloatingTooltipInternal = ({ text, visible, anchorRef }: FloatingTooltipProps) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isAutoHidden, setIsAutoHidden] = useState(false);

  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);

  useEffect(() => {
    if (!isMobile && visible && anchorRef.current && text) {
      const updatePosition = () => {
        if (anchorRef.current) {
          const rect = anchorRef.current.getBoundingClientRect();
          setCoords({
            top: rect.top - 8,
            left: rect.left + rect.width / 2
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [visible, anchorRef, text, isMobile]);

  useEffect(() => {
    if (visible && !isMobile) {
      setIsAutoHidden(false);
      const timer = setTimeout(() => setIsAutoHidden(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setIsAutoHidden(false);
    }
  }, [visible, isMobile]);

  if (isMobile || !visible || !coords || !text || isAutoHidden) return null;

  const match = typeof text === 'string' ? text.match(/^(.*)\s?\[(.+)\]$/) : null;
  const displayContent = match ? match[1] : text;
  const shortcutKey = match ? match[2] : null;

  return createPortal(
    <div className="fixed z-[9999] pointer-events-none" style={{ top: coords.top, left: coords.left, transform: 'translate(-50%, -100%)' }}>
      <div className="animate-fade-in-up">
        <div className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap flex items-center gap-2 relative border border-white/10">
          <span>{displayContent}</span>
          {shortcutKey && (<span className="px-1.5 py-0.5 bg-black/20 rounded border border-white/10 text-[10px] font-mono shadow-sm tracking-wider">{shortcutKey}</span>)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-blue-600" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export const FloatingTooltip = memo(FloatingTooltipInternal);

export const TooltipArea = memo(({ children, text }: { children?: React.ReactNode, text: string | undefined | null }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppContext();
  
  const shouldShow = settings.showTooltips && isHovered;
  
  return (
    <div ref={containerRef} className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <FloatingTooltip text={text} visible={shouldShow} anchorRef={containerRef} />
      {children}
    </div>
  );
});
