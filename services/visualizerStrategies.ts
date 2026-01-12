
import { IVisualizerRenderer, VisualizerSettings } from '../types';

// --- Helper Functions ---
function getAverage(data: Uint8Array, start: number, end: number) {
  let sum = 0;
  const safeEnd = Math.min(end, data.length);
  const safeStart = Math.min(start, safeEnd);
  if (safeEnd === safeStart) return 0;
  for(let i=safeStart; i<safeEnd; i++) sum += data[i];
  return sum / (safeEnd - safeStart);
}

// --- Renderers ---

export class BarsRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings) {
    const barCount = 64; 
    const step = Math.floor(data.length / barCount); 
    const barWidth = (w / barCount) / 2; 
    const centerX = w / 2;
    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;

    for (let i = 0; i < barCount; i++) {
      const value = data[i * step] * settings.sensitivity;
      const barHeight = Math.min((value / 255) * h * 0.8, h * 0.9);
      const gradient = ctx.createLinearGradient(0, h/2 + barHeight/2, 0, h/2 - barHeight/2);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(0.5, c0);
      gradient.addColorStop(1, c1);
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX + (i * barWidth), (h - barHeight) / 2, barWidth - 2, barHeight);
      ctx.fillRect(centerX - ((i + 1) * barWidth), (h - barHeight) / 2, barWidth - 2, barHeight);
    }
  }
}

export class RingsRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRings = 15;
    if (colors.length === 0) return;
    for(let i = 0; i < maxRings; i++) {
        const freqIndex = i * 8; 
        const val = data[freqIndex] * settings.sensitivity;
        const radius = 30 + (i * 20) + Math.min(val, 100);
        ctx.beginPath();
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = (2 + (val / 40)) * settings.sensitivity;
        const startAngle = rotation * (i % 2 === 0 ? 1 : -1) + i; 
        const endAngle = startAngle + (Math.PI * 1.5) + (val / 255); 
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
    }
  }
}

export class ParticlesRenderer implements IVisualizerRenderer {
  private particles: Array<{x: number, y: number, vx: number, vy: number, life: number, size: number}> = [];
  init() { this.particles = []; }
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const time = rotation * 0.8;
    const centerX = w / 2 + Math.sin(time) * (w * 0.1);
    const centerY = h / 2 + Math.cos(time * 1.3) * (h * 0.1);
    let mids = getAverage(data, 10, 50) / 255;
    let bass = getAverage(data, 0, 10) / 255;
    if (settings.glow) {
        ctx.save();
        const nebulaRadius = Math.max(w, h) * (0.4 + bass * 0.3 * settings.sensitivity);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nebulaRadius);
        ctx.globalAlpha = 0.1 + (bass * 0.2);
        gradient.addColorStop(0, colors[1] || colors[0]);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
    const maxParticles = 200;
    while (this.particles.length < maxParticles) {
        this.particles.push({
            x: (Math.random() - 0.5) * w * 2, 
            y: (Math.random() - 0.5) * h * 2,
            life: w * (Math.random() * 0.5 + 0.5), 
            vx: w, vy: 0, size: Math.random() * 2 + 0.5
        });
    }
    const warpSpeed = (0.5 + (mids * 40)) * settings.speed * settings.sensitivity;
    const cosR = Math.cos(rotation * 0.3);
    const sinR = Math.sin(rotation * 0.3);
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= warpSpeed;
        if (p.life <= 10) {
            p.x = (Math.random() - 0.5) * w * 2;
            p.y = (Math.random() - 0.5) * h * 2;
            p.life = w;
            continue;
        }
        const scale = 250 / p.life;
        const rx = p.x * cosR - p.y * sinR;
        const ry = p.x * sinR + p.y * cosR;
        const sx = centerX + rx * scale;
        const sy = centerY + ry * scale;
        ctx.globalAlpha = Math.min(1, p.life > w * 0.8 ? (w - p.life) / (w * 0.2) : p.life / 50);
        ctx.fillStyle = warpSpeed > 10 ? (colors[i % colors.length] || '#fff') : '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * scale * 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}

export class TunnelRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const centerX = w / 2;
    const centerY = h / 2;
    const shapes = 12;
    const maxRadius = Math.max(w, h) * 0.7;
    ctx.save();
    ctx.translate(centerX, centerY);
    for (let i = 0; i < shapes; i++) {
        const value = data[Math.floor((i / shapes) * 40)] * settings.sensitivity;
        const depth = (i + (rotation * 5)) % shapes; 
        const scale = Math.pow(depth / shapes, 2); 
        const radius = maxRadius * scale * (1 + (value / 500)); 
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = (1 + (scale * 20)) * settings.sensitivity;
        ctx.globalAlpha = scale; 
        ctx.beginPath();
        for (let j = 0; j <= 6; j++) {
            const angle = (j / 6) * Math.PI * 2 + rotation * (i % 2 === 0 ? 1 : -1);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
  }
}

export class PlasmaRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) {
        const avg = i < 2 ? getAverage(data, 0, 10) : i < 4 ? getAverage(data, 10, 50) : getAverage(data, 50, 150);
        const intensity = Math.pow(avg / 255, 1.5) * settings.sensitivity;
        const t = rotation * (0.2 + i * 0.1) * settings.speed + (i * Math.PI / 3);
        const x = w/2 + Math.sin(t) * (w * 0.3) * Math.cos(t * 0.5);
        const y = h/2 + Math.cos(t * 0.8) * (h * 0.3) * Math.sin(t * 0.3);
        const radius = Math.max(w, h) * (0.15 + intensity * 0.4);
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, '#fff');
        const c = colors[i % colors.length] || '#fff';
        g.addColorStop(0.2, c);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3 + intensity * 0.7;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

export class ShapesRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const bass = getAverage(data, 0, 10) * settings.sensitivity;
    const mids = getAverage(data, 10, 60) * settings.sensitivity;
    ctx.save();
    ctx.translate(w/2, h/2);
    for (let i = 0; i < 8; i++) {
        const sides = 3 + i;
        const radius = (Math.min(w, h) * 0.05 * (i + 1)) + (bass / 255) * 50;
        const angleOffset = rotation * (0.5 + i * 0.1) * (i % 2 === 0 ? 1 : -1);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2 + (mids / 100);
        ctx.beginPath();
        for (let j = 0; j <= sides; j++) {
            const a = (j / sides) * Math.PI * 2 + angleOffset;
            const px = Math.cos(a) * radius;
            const py = Math.sin(a) * radius;
            if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * 终极优化版 NebulaRenderer (星云迷雾)
 * 模拟星云内部的流体涡流和气体分形质感。
 */
export class NebulaRenderer implements IVisualizerRenderer {
  private particles: Array<{
    x: number; y: number; 
    vx: number; vy: number; 
    life: number; maxLife: number; 
    size: number; 
    colorIndex: number; 
    rotation: number;
    rotationSpeed: number;
    noiseOffset: number;
  }> = [];

  private spriteCache: Record<string, HTMLCanvasElement> = {};

  init() {
    this.particles = [];
    this.spriteCache = {};
  }

  // 生成具有“分形”质感的烟雾精灵图
  private getSprite(color: string): HTMLCanvasElement {
    if (this.spriteCache[color]) return this.spriteCache[color];

    const size = 300; 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const centerX = size / 2;
    const centerY = size / 2;

    // 通过绘制数十个半透明、大小不一的偏移径向块来模拟气体内部的不均匀质感
    for (let i = 0; i < 24; i++) {
        const offsetX = (Math.random() - 0.5) * size * 0.25;
        const offsetY = (Math.random() - 0.5) * size * 0.25;
        const radius = size * (0.15 + Math.random() * 0.25);
        const opacity = 0.04 + Math.random() * 0.08;

        const g = ctx.createRadialGradient(centerX + offsetX, centerY + offsetY, 0, centerX + offsetX, centerY + offsetY, radius);
        g.addColorStop(0, `rgba(255,255,255,${opacity})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 遮盖染色
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    this.spriteCache[color] = canvas;
    return canvas;
  }

  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;

    // 音频维度：低音驱动亮度，中音驱动旋转，高音触发星尘
    const bass = getAverage(data, 0, 15) / 255; 
    const mids = getAverage(data, 15, 60) / 255; 
    const highs = getAverage(data, 100, 200) / 255; 

    const maxParticles = 60; // 较少的粒子数但每个粒子更大、更细腻
    if (this.particles.length < maxParticles) {
        for (let i = 0; i < 1; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: 0, vy: 0,
                life: Math.random() * 800,
                maxLife: 800 + Math.random() * 400,
                size: (w * 0.4) + (Math.random() * w * 0.4),
                colorIndex: Math.floor(Math.random() * colors.length),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.005,
                noiseOffset: Math.random() * 1000
            });
        }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const sensitivity = settings.sensitivity;
    const speedScale = settings.speed;

    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life += speedScale * 1.5;

        // --- 流体动力学模拟 (Fluid Motion) ---
        // 这里的公式模拟了空气涡流：根据位置和时间产生旋转力
        const timeFactor = rotation * 0.4;
        const driftX = Math.sin(p.x * 0.002 + timeFactor) * 0.2;
        const driftY = Math.cos(p.y * 0.002 + timeFactor) * 0.2;
        
        // 音频扰动
        const energy = (bass * 3.0 + mids * 1.5) * sensitivity;
        p.vx += (driftX + (Math.random() - 0.5) * 0.05) * speedScale;
        p.vy += (driftY - 0.02) * speedScale; // 整体微弱的上升感
        
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx * (1 + energy);
        p.y += p.vy * (1 + energy);
        p.rotation += p.rotationSpeed * (1 + mids * 6) * speedScale;

        // 边界处理
        const margin = p.size * 0.6;
        if (p.x < -margin) p.x = w + margin;
        if (p.x > w + margin) p.x = -margin;
        if (p.y < -margin) p.y = h + margin;
        if (p.y > h + margin) p.y = -margin;

        if (p.life > p.maxLife) {
            p.life = 0;
            p.colorIndex = (p.colorIndex + 1) % colors.length;
        }

        // --- 视觉表现 ---
        const fadeInOut = Math.sin((p.life / p.maxLife) * Math.PI);
        // 低音瞬间提亮：模拟气体被“点燃”的炽热感
        const dynamicAlpha = (0.08 + bass * 0.35) * fadeInOut * sensitivity;
        
        const c = colors[p.colorIndex % colors.length] || '#fff';
        const sprite = this.getSprite(c);
        // 低音带来的体积膨胀
        const finalSize = p.size * (1 + bass * 0.25 * sensitivity);

        ctx.globalAlpha = Math.min(0.5, dynamicAlpha);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(sprite, -finalSize/2, -finalSize/2, finalSize, finalSize);
        ctx.restore();
    }

    // --- 星尘图层 (Stardust) ---
    // 高频激发细碎的、闪烁的背景星尘
    if (highs > 0.35) {
        ctx.globalAlpha = (highs - 0.35) * 2;
        ctx.fillStyle = '#ffffff';
        for (let j = 0; j < 6; j++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            const sz = Math.random() * 2 * sensitivity;
            ctx.beginPath();
            ctx.arc(sx, sy, sz, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
  }
}

export class KaleidoscopeRenderer implements IVisualizerRenderer {
    init() {}
    draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
        if (colors.length === 0) return;
        ctx.save();
        ctx.translate(w/2, h/2);
        ctx.rotate(rotation * 0.15 * settings.speed); 
        const segments = 12;
        const angleStep = (Math.PI * 2) / segments;
        const radius = Math.max(w, h) * 0.65;

        for (let i = 0; i < segments; i++) {
            ctx.save();
            ctx.rotate(i * angleStep);
            ctx.beginPath();
            const step = Math.floor(data.length / 50);
            for(let j=0; j<50; j++) {
                const val = data[j * step] * settings.sensitivity;
                const r = (j / 50) * radius;
                const y = (val / 255) * 120 * Math.sin(j * 0.25 + rotation * 4);
                if (j===0) ctx.moveTo(r, y); else ctx.lineTo(r, y);
            }
            ctx.strokeStyle = colors[i % colors.length] || '#fff';
            ctx.lineWidth = 2.5; ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
}
