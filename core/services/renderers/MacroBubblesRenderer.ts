/**
 * File: core/services/renderers/MacroBubblesRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils'; // Import getAverage

export class MacroBubblesRenderer implements IVisualizerRenderer {
  private bubbles: Array<{ 
    x: number, y: number, r: number, vx: number, vy: number, 
    colorIdx: number, noiseOffset: number, sharpness: number 
  }> = [];
  
  init() {
    this.bubbles = [];
  }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    const highs = getAverage(data, 120, 200) / 255 * settings.sensitivity;

    const count = settings.quality === 'high' ? 30 : 15;

    if (this.bubbles.length !== count) {
      if (this.bubbles.length > count) {
        this.bubbles = this.bubbles.slice(0, count);
      } 
      while (this.bubbles.length < count) {
        const r = 30 + Math.random() * 100;
        const distFromFocus = Math.abs(r - 80) / 60;
        const sharpness = Math.max(0.1, 1.0 - Math.pow(distFromFocus, 2));

        this.bubbles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: r,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          colorIdx: Math.floor(Math.random() * colors.length),
          noiseOffset: Math.random() * 1000,
          sharpness: sharpness
        });
      }
    }

    ctx.save();
    
    this.bubbles.forEach((p) => {
      const time = rotation * settings.speed * 0.2;
      const noiseX = Math.sin(p.y * 0.004 + time + p.noiseOffset) * 0.5;
      const noiseY = Math.cos(p.x * 0.004 + time + p.noiseOffset) * 0.5;

      p.vx = p.vx * 0.96 + noiseX * 0.15;
      p.vy = p.vy * 0.96 + noiseY * 0.15;
      p.x += p.vx * settings.speed * (1 + bass);
      p.y += p.vy * settings.speed * (1 + bass);
      
      if (p.x < -p.r) p.x = w + p.r;
      if (p.x > w + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = h + p.r;
      if (p.y > h + p.r) p.y = -p.r;

      const beatPop = beat ? 0.2 : 0;
      const dynamicR = p.r * (1 + bass * 0.2 + beatPop);
      const color = colors[p.colorIdx % colors.length];
      const sharpness = p.sharpness;

      const bodyGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicR);
      
      const rimPos = 0.6 + (sharpness * 0.3);
      const rimAlpha = 0.2 + (sharpness * 0.6);
      const centerAlpha = 0.1 + (sharpness * 0.1);
      
      const rimHex = `${color}${Math.floor(rimAlpha * 255).toString(16).padStart(2,'0')}`;
      const centerHex = `${color}${Math.floor(centerAlpha * 255).toString(16).padStart(2,'0')}`;
      const midHex = `${color}${Math.floor(centerAlpha * 1.5 * 255).toString(16).padStart(2,'0')}`;

      bodyGradient.addColorStop(0, centerHex);
      bodyGradient.addColorStop(rimPos * 0.7, midHex); 
      bodyGradient.addColorStop(rimPos, rimHex);
      
      const fadeEnd = Math.min(1, rimPos + (0.1 + (1-sharpness) * 0.2));
      bodyGradient.addColorStop(fadeEnd, `${color}00`);
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dynamicR, 0, Math.PI * 2);
      ctx.fill();

      const highlightStrength = Math.min(0.8, highs * 2.5 + (beat ? 0.3 : 0));
      if (highlightStrength > 0.05) {
          const highlightOffset = dynamicR * 0.35;
          const hX = p.x - highlightOffset;
          const hY = p.y - highlightOffset;
          const hSize = dynamicR * (0.3 + (1 - sharpness) * 0.3);
          const highlightGradient = ctx.createRadialGradient(hX, hY, 0, hX, hY, hSize);
          const hAlpha = highlightStrength * (0.4 + sharpness * 0.6);
          highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${hAlpha})`);
          highlightGradient.addColorStop(0.2 * sharpness, `rgba(255, 255, 255, ${hAlpha * 0.8})`);
          highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.fillStyle = highlightGradient;
          ctx.beginPath();
          ctx.arc(hX, hY, hSize, 0, Math.PI * 2);
          ctx.fill();
      }
    });

    ctx.restore();
  }
}