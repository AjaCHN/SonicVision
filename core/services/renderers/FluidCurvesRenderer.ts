/**
 * File: core/services/renderers/FluidCurvesRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils'; // Import getAverage

export class FluidCurvesRenderer implements IVisualizerRenderer {
  private layerOffsets: { phase: number; freq1: number; freq2: number; vert: number; speedMult: number; }[] = [];
  
  init() {
    this.layerOffsets = [];
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const bass = getAverage(data, 0, 10) / 255 * settings.sensitivity;
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    const layerCount = settings.quality === 'high' ? 5 : 3;
    const time = rotation * settings.speed;

    if (this.layerOffsets.length !== layerCount) {
      this.layerOffsets = [];
      for (let i = 0; i < layerCount; i++) {
        this.layerOffsets.push({
          phase: Math.random() * Math.PI * 2,
          freq1: 0.002 + Math.random() * 0.0025, 
          freq2: 0.005 + Math.random() * 0.0035, 
          vert: (Math.random() - 0.5) * 0.15,
          speedMult: 0.2 + Math.random() * 2.2
        });
      }
    }

    for (let i = 0; i < layerCount; i++) {
      const color = colors[i % colors.length];
      const offsets = this.layerOffsets[i];
      const layerTime = time * offsets.speedMult;

      ctx.fillStyle = color;
      
      const beatAlpha = beat ? 0.2 : 0;
      ctx.globalAlpha = 0.2 + bass * 0.3 + beatAlpha;
      
      const segments = 20;
      const step = w / segments;
      const points = [];

      for (let s = 0; s <= segments; s++) {
        const x = s * step;
        const offset = Math.sin(x * offsets.freq1 + layerTime + offsets.phase) * (h * 0.15);
        const audioBump = Math.cos(x * offsets.freq2 + layerTime * 1.5 + offsets.phase) * (bass * 180);
        const y = h * (0.4 + i * 0.08 + offsets.vert) + offset + audioBump;
        points.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(points[0].x, points[0].y);

      for (let j = 0; j < points.length - 1; j++) {
        const xc = (points[j].x + points[j + 1].x) / 2;
        const yc = (points[j].y + points[j + 1].y) / 2;
        ctx.quadraticCurveTo(points[j].x, points[j].y, xc, yc);
      }
      
      ctx.quadraticCurveTo(
        points[points.length - 1].x,
        points[points.length - 1].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
      
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
}