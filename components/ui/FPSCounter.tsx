
import React, { useState, useEffect } from 'react';

export const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return (
    <div className="fixed top-4 left-4 z-[200] text-[9px] font-mono text-green-400 font-bold bg-black/50 px-2 py-1 rounded border border-green-500/30 backdrop-blur-sm shadow-lg pointer-events-none select-none">
      FPS: {fps}
    </div>
  );
};
