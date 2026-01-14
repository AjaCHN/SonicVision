
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
  private particles: Array<{ 
    x: number; y: number; vx: number; vy: number; 
    life: number; maxLife: number; size: number; 
    colorIndex: number; rotation: number; rotationSpeed: number; 
    noiseOffset: number; 
  }> = [];
  private spriteCache: Record<string, HTMLCanvasElement> = {};
  private spawnCenter = { x: 0, y: 0 };

  init() { 
    this.particles = []; 
    this.spriteCache = {}; 
  }

  private getSprite(color: string): HTMLCanvasElement {
    if (this.spriteCache[color]) return this.spriteCache[color];
    const size = 400; 
    const canvas = document.createElement('canvas'); 
    canvas.width = size; canvas.height = size; 
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.45);
    g.addColorStop(0, `rgba(255,255,255,0.15)`); 
    g.addColorStop(0.5, `rgba(255,255,255,0.05)`);
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
    // Bias spawn towards a moving focus point
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (Math.min(w, h) * 0.4);
    p.x = this.spawnCenter.x + Math.cos(angle) * dist;
    p.y = this.spawnCenter.y + Math.sin(angle) * dist;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = (Math.random() - 0.5) * 0.5;
    p.life = 0;
    p.maxLife = 1000 + Math.random() * 800;
    p.size = (w * 0.25) + (Math.random() * w * 0.3);
    p.colorIndex = Math.floor(Math.random() * colorsCount);
    p.rotation = Math.random() * Math.PI * 2;
    p.rotationSpeed = (Math.random() - 0.5) * 0.003;
  }

  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    
    // Update global spawn center to drift slowly
    this.spawnCenter.x = w/2 + Math.sin(rotation * 0.2) * (w * 0.2);
    this.spawnCenter.y = h/2 + Math.cos(rotation * 0.15) * (h * 0.2);

    const bass = getAverage(data, 0, 15) / 255;
    const maxParticles = settings.quality === 'high' ? 65 : settings.quality === 'med' ? 40 : 20;

    if (this.particles.length < maxParticles) {
        const p = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 0, colorIndex: 0, rotation: 0, rotationSpeed: 0, noiseOffset: Math.random() * 1000 };
        // Initial spread
        this.resetParticle(p, w, h, colors.length);
        p.life = Math.random() * p.maxLife; 
        this.particles.push(p);
    } else if (this.particles.length > maxParticles) {
        this.particles = this.particles.slice(0, maxParticles);
    }

    ctx.save(); 
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]; 
        p.life += settings.speed * 1.2;
        
        // Fluid noise-like movement
        const timeFactor = rotation * 0.3;
        const driftX = Math.sin(p.x * 0.0015 + timeFactor) * 0.35;
        const driftY = Math.cos(p.y * 0.0015 + timeFactor) * 0.35;
        
        p.vx = p.vx * 0.98 + driftX * settings.speed;
        p.vy = p.vy * 0.98 + (driftY - 0.05) * settings.speed; 
        
        p.x += p.vx * (1 + bass * 4); 
        p.y += p.vy * (1 + bass * 4);
        p.rotation += p.rotationSpeed * (1 + bass * 2);

        if (p.life > p.maxLife) { 
          this.resetParticle(p, w, h, colors.length);
        }

        const fadeInOut = Math.sin((p.life / p.maxLife) * Math.PI); 
        const dynamicAlpha = (0.05 + bass * 0.4) * fadeInOut * settings.sensitivity;
        
        if (dynamicAlpha < 0.005) continue;

        const sprite = this.getSprite(colors[p.colorIndex % colors.length] || '#fff'); 
        const finalSize = p.size * (1 + bass * 0.3 * settings.sensitivity);
        
        ctx.globalAlpha = Math.min(0.4, dynamicAlpha); 
        ctx.save(); 
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.rotation); 
        ctx.drawImage(sprite, -finalSize/2, -finalSize/2, finalSize, finalSize); 
        ctx.restore();
    }
    ctx.restore();
  }
}
