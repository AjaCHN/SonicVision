/**
 * File: core/services/renderers/ParticlesRenderer.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils'; // Import getAverage

export class ParticlesRenderer implements IVisualizerRenderer {
  private particles: Array<{ 
    angle: number; 
    radius: number; 
    z: number; 
    speedOffset: number; 
    prevX: number; 
    prevY: number; 
    colorIdx: number; 
    size: number;
  }> = [];

  init() { this.particles = []; }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const driftX = Math.sin(rotation * 0.5) * (w * 0.15);
    const driftY = Math.cos(rotation * 0.3) * (h * 0.15);
    const centerX = w / 2 + driftX;
    const centerY = h / 2 + driftY;

    const bass = getAverage(data, 0, 10) / 255;
    const treble = getAverage(data, 100, 200) / 255;
    
    const maxParticles = settings.quality === 'high' ? 250 : settings.quality === 'med' ? 150 : 80;

    if (this.particles.length !== maxParticles) {
        this.particles = [];
        for (let i = 0; i < maxParticles; i++) {
            this.particles.push(this.createParticle(w, h, Math.random() * 1000, colors.length));
        }
    }

    const baseSpeed = settings.speed * 10;
    const beatSurge = beat ? 2.5 : 1.0;
    const speed = baseSpeed * (1 + bass * 6 + treble * 2) * beatSurge; 
    const rotSpeed = 0.001 * settings.speed * (1 + bass * 2);

    ctx.lineCap = 'round';

    for (const p of this.particles) {
        p.z -= speed * p.speedOffset;
        p.angle += rotSpeed * p.speedOffset;

        if (p.z <= 10) {
            Object.assign(p, this.createParticle(w, h, 1000 + Math.random() * 200, colors.length));
            p.prevX = -9999;
            p.prevY = -9999;
            continue;
        }

        const fov = 300;
        const scale = fov / p.z;
        const x = centerX + Math.cos(p.angle) * p.radius * scale;
        const y = centerY + Math.sin(p.angle) * p.radius * scale;

        if (p.prevX !== -9999) {
            const dx = x - p.prevX;
            const dy = y - p.prevY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < w * 0.5) {
                const color = colors[p.colorIdx % colors.length];
                const size = p.size * scale * (1 + bass * 2.0);
                const alpha = Math.min(1, scale * 1.5); 

                ctx.lineWidth = Math.max(0.5, size);
                ctx.strokeStyle = color;
                ctx.globalAlpha = alpha;
                
                ctx.beginPath();
                ctx.moveTo(p.prevX, p.prevY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        p.prevX = x;
        p.prevY = y;
    }
    ctx.globalAlpha = 1.0;
  }

  private createParticle(w: number, h: number, z: number, colorCount: number) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.max(w, h);
      const radius = Math.random() * spread * 1.5 + spread * 0.1; 

      return { 
          angle,
          radius, 
          z, 
          speedOffset: 0.5 + Math.random(), 
          prevX: -9999, 
          prevY: -9999,
          size: 0.5 + Math.random() * 1.5,
          colorIdx: Math.floor(Math.random() * colorCount)
      };
  }
}