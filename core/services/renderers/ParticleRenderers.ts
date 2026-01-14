
import { IVisualizerRenderer, VisualizerSettings } from '../../types/index';
import { getAverage } from '../audioUtils';

export class ParticlesRenderer implements IVisualizerRenderer {
  private particles: Array<{ x: number; y: number; z: number; px: number; py: number; size: number; colorOffset: number; }> = [];
  init() { this.particles = []; }
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const time = rotation * 0.5;
    const centerX = w / 2 + Math.sin(time) * (w * 0.15);
    const centerY = h / 2 + Math.cos(time * 0.7) * (h * 0.15);
    const mids = getAverage(data, 10, 50) / 255;
    const bass = getAverage(data, 0, 10) / 255;
    const highs = getAverage(data, 100, 200) / 255;
    const maxParticles = settings.quality === 'high' ? 300 : settings.quality === 'med' ? 180 : 80;
    if (this.particles.length === 0) {
        for (let i = 0; i < maxParticles; i++) this.particles.push(this.createParticle(w, h, Math.random() * w));
    } else if (this.particles.length < maxParticles) {
        this.particles.push(this.createParticle(w, h, w));
    } else if (this.particles.length > maxParticles) {
        this.particles = this.particles.slice(0, maxParticles);
    }
    const moveSpeed = (2 + (mids * 40) + (highs * 20)) * settings.speed * settings.sensitivity;
    ctx.lineCap = 'round';
    for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.z -= moveSpeed;
        if (p.z <= 1) {
            this.particles[i] = this.createParticle(w, h, w);
            continue; 
        }
        const k = 128.0 / p.z;
        const px = (p.x * k) + centerX;
        const py = (p.y * k) + centerY;
        const isOutside = (px < 0 || px > w || py < 0 || py > h) && (p.px < 0 || p.px > w || p.py < 0 || p.py > h);
        if (!isOutside) {
            const size = p.size * k * (settings.quality === 'low' ? 2 : 1);
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = size;
            ctx.globalAlpha = Math.min(1, (w - p.z) / (w * 0.3));
            ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(px, py); ctx.stroke();
        }
        p.px = px; p.py = py;
    }
    ctx.globalAlpha = 1.0;
  }
  private createParticle(w: number, h: number, z: number) {
      return { x: (Math.random() - 0.5) * w * 2, y: (Math.random() - 0.5) * h * 2, z: z, px: w / 2, py: h / 2, size: Math.random() * 1.5 + 0.5, colorOffset: Math.random() };
  }
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; colorIndex: number; rotation: number; rotationSpeed: number; noiseOffset: number; }> = [];
  private spriteCache: Record<string, HTMLCanvasElement> = {};
  init() { this.particles = []; this.spriteCache = {}; }
  private getSprite(color: string): HTMLCanvasElement {
    if (this.spriteCache[color]) return this.spriteCache[color];
    const size = 300; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.4);
    g.addColorStop(0, `rgba(255,255,255,0.1)`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(size/2, size/2, size * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = color; ctx.fillRect(0, 0, size, size);
    this.spriteCache[color] = canvas; return canvas;
  }
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const bass = getAverage(data, 0, 15) / 255;
    const maxParticles = settings.quality === 'high' ? 60 : settings.quality === 'med' ? 40 : 25;
    if (this.particles.length < maxParticles) {
        this.particles.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, life: Math.random() * 800, maxLife: 800 + Math.random() * 400, size: (w * 0.28) + (Math.random() * w * 0.28), colorIndex: Math.floor(Math.random() * colors.length), rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.005, noiseOffset: Math.random() * 1000 });
    }
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]; p.life += settings.speed * 1.5;
        const driftX = Math.sin(p.x * 0.002 + rotation * 0.4) * 0.2; const driftY = Math.cos(p.y * 0.002 + rotation * 0.4) * 0.2;
        p.vx += (driftX + (Math.random() - 0.5) * 0.05) * settings.speed; p.vy += (driftY - 0.02) * settings.speed;
        p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx * (1 + bass * 3); p.y += p.vy * (1 + bass * 3);
        if (p.life > p.maxLife) { p.life = 0; p.colorIndex = (p.colorIndex + 1) % colors.length; }
        const fadeInOut = Math.sin((p.life / p.maxLife) * Math.PI); const dynamicAlpha = (0.08 + bass * 0.35) * fadeInOut * settings.sensitivity;
        if (dynamicAlpha < 0.01) continue;
        const sprite = this.getSprite(colors[p.colorIndex % colors.length] || '#fff'); const finalSize = p.size * (1 + bass * 0.25 * settings.sensitivity);
        ctx.globalAlpha = Math.min(0.5, dynamicAlpha); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.drawImage(sprite, -finalSize/2, -finalSize/2, finalSize, finalSize); ctx.restore();
    }
    ctx.restore();
  }
}
