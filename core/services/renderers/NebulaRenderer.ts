
/**
 * File: core/services/renderers/NebulaRenderer.ts
 * Version: 1.0.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */


import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';
import { getAverage } from '../audioUtils'; // Import getAverage

// Helper to create an offscreen-capable canvas depending on the environment
const createBufferCanvas = (width: number, height: number): OffscreenCanvas | HTMLCanvasElement => {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: Array<{ 
    x: number; y: number; vx: number; vy: number; 
    life: number; maxLife: number; size: number; 
    colorIndex: number; rotation: number; rotationSpeed: number; 
    depth: number; 
  }> = [];
  
  // Cache can hold either OffscreenCanvas or HTMLCanvasElement
  private spriteCache: Record<string, OffscreenCanvas | HTMLCanvasElement> = {}; 
  private readonly MAX_SPRITE_CACHE = 32;

  init() { 
    this.particles = []; 
    this.spriteCache = {}; 
  }

  private getSprite(color: string): OffscreenCanvas | HTMLCanvasElement {
    if (this.spriteCache[color]) return this.spriteCache[color];
    
    // Cache eviction policy: clear old cache when threshold is exceeded.
    if (Object.keys(this.spriteCache).length >= this.MAX_SPRITE_CACHE) {
      this.spriteCache = {};
    }

    const size = 400; 
    const canvas = createBufferCanvas(size, size);
    
    // Using 'any' for ctx to support both OffscreenCanvasRenderingContext2D and CanvasRenderingContext2D
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as any; 
    if (!ctx) return canvas;
    
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.45);
    g.addColorStop(0, `rgba(255,255,255,0.2)`);
    g.addColorStop(0.2, `rgba(255,255,255,0.1)`);
    g.addColorStop(0.7, `rgba(255,255,255,0.02)`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = g; 
    ctx.beginPath(); 
    ctx.arc(size/2, size/2, size * 0.45, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-in'; 
    ctx.fillStyle = color; 
    ctx.fillRect(0, 0, size, size);
    
    this.spriteCache[color] = canvas; 
    return canvas;
  }

  private resetParticle(p: any, w: number, h: number, colorsCount: number) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.vx = 0;
    p.vy = 0;
    p.life = 0;
    p.maxLife = 2000 + Math.random() * 1500;
    p.colorIndex = Math.floor(Math.random() * colorsCount);
    p.rotation = Math.random() * Math.PI * 2;
    p.rotationSpeed = (Math.random() - 0.5) * 0.001;
    p.depth = Math.random() * 0.6 + 0.4; 
    p.size = (w * 0.2) * p.depth + (Math.random() * w * 0.2);
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    if (colors.length === 0) return;
    
    // Use imported getAverage function
    const bass = getAverage(data, 0, 15) / 255;
    const maxParticles = settings.quality === 'high' ? 50 : settings.quality === 'med' ? 30 : 15;

    while (this.particles.length < maxParticles) {
        const p = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 0, colorIndex: 0, rotation: 0, rotationSpeed: 0, depth: 1 };
        this.resetParticle(p, w, h, colors.length);
        p.life = Math.random() * p.maxLife; 
        this.particles.push(p);
    }
    
    ctx.save(); 
    ctx.globalCompositeOperation = 'screen';

    const vortexCenterX = w / 2 + Math.sin(rotation * 0.1) * 100;
    const vortexCenterY = h / 2 + Math.cos(rotation * 0.1) * 100;

    for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]; 
        p.life += settings.speed * p.depth; 
        
        const angleToCenter = Math.atan2(vortexCenterY - p.y, vortexCenterX - p.x);
        
        const vortexStrength = 0.02 * p.depth * (1 + bass * 3);
        const windX = Math.cos(angleToCenter) * vortexStrength;
        const windY = Math.sin(angleToCenter) * vortexStrength;

        p.vx = p.vx * 0.96 + windX * settings.speed;
        p.vy = p.vy * 0.96 + windY * settings.speed; 
        
        p.x += p.vx * (1 + bass * 3); 
        p.y += p.vy * (1 + bass * 3);
        p.rotation += p.rotationSpeed * settings.speed;

        if (p.life > p.maxLife || p.x < -p.size || p.x > w + p.size || p.y < -p.size || p.y > h + p.size) { 
          this.resetParticle(p, w, h, colors.length);
        }

        const fadeInOut = Math.sin((p.life / p.maxLife) * Math.PI); 
        const beatFlash = beat ? 0.3 : 0;
        const dynamicAlpha = (0.1 + bass * 0.8 + beatFlash) * fadeInOut * settings.sensitivity * p.depth;
        
        if (dynamicAlpha < 0.005) continue;

        const sprite = this.getSprite(colors[p.colorIndex % colors.length] || '#fff'); 
        const finalSize = p.size * (1 + bass * 0.8 * settings.sensitivity);
        
        ctx.globalAlpha = Math.min(0.6, dynamicAlpha); 
        ctx.save(); 
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.rotation); 
        // Cast to any to satisfy TS, as ctx is generic RenderContext but we know it accepts standard canvas types
        ctx.drawImage(sprite as any, -finalSize/2, -finalSize/2, finalSize, finalSize); 
        ctx.restore();
    }
    ctx.restore();
  }
}
