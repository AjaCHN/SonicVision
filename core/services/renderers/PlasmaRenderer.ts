/**
 * File: core/services/renderers/PlasmaRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils'; // Import getAverage

export class PlasmaRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const getAvgLocal = (s: number, e: number) => getAverage(data, s, e);

    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) {
        const avg = i < 2 ? getAvgLocal(0, 10) : i < 4 ? getAvgLocal(10, 50) : getAvgLocal(50, 150);
        
        // Burst intensity on beat
        const beatBoost = beat ? 1.0 : 0;
        const intensity = (Math.pow(avg / 255, 1.5) * settings.sensitivity * 1.5) + beatBoost;
        
        const t = rotation * (0.2 + i * 0.1) * settings.speed + (i * Math.PI / 3);
        const x = w/2 + Math.sin(t) * (w * 0.3) * Math.cos(t * 0.5);
        const y = h/2 + Math.cos(t * 0.8) * (h * 0.3) * Math.sin(t * 0.3);
        
        const radius = Math.max(w, h) * (0.15 + intensity * 0.6); 
        
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.2, colors[i % colors.length] || '#fff');
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3 + intensity * 0.7;
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}