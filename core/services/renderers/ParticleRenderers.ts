
import { IVisualizerRenderer, VisualizerSettings } from '../../types/index';
import { getAverage } from '../audioUtils';

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

  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    
    // Dynamic Center Point (Drifting Origin)
    // Instead of fixed center, the origin moves in a Lissajous-like pattern
    const driftX = Math.sin(rotation * 0.5) * (w * 0.15);
    const driftY = Math.cos(rotation * 0.3) * (h * 0.15);
    const centerX = w / 2 + driftX;
    const centerY = h / 2 + driftY;

    const bass = getAverage(data, 0, 10) / 255;
    const treble = getAverage(data, 100, 200) / 255;
    
    // Increased particle count for better density
    const maxParticles = settings.quality === 'high' ? 250 : settings.quality === 'med' ? 150 : 80;

    if (this.particles.length !== maxParticles) {
        this.particles = [];
        for (let i = 0; i < maxParticles; i++) {
            this.particles.push(this.createParticle(w, h, Math.random() * 1000, colors.length));
        }
    }

    // Physics
    // Reduced base speed from 20 to 10 to make maximum speed more manageable
    const baseSpeed = settings.speed * 10;
    // Non-linear reactivity: Bass punches speed HARD, Treble adds jitter/energy
    const speed = baseSpeed * (1 + bass * 6 + treble * 2); 
    const rotSpeed = 0.001 * settings.speed * (1 + bass * 2);

    ctx.lineCap = 'round';

    for (const p of this.particles) {
        p.z -= speed * p.speedOffset;
        p.angle += rotSpeed * p.speedOffset; // Spiral effect

        if (p.z <= 10) {
            // Respawn at back
            Object.assign(p, this.createParticle(w, h, 1000 + Math.random() * 200, colors.length));
            // Reset prev coords to avoid cross-screen lines
            p.prevX = -9999;
            p.prevY = -9999;
            continue;
        }

        // Perspective Projection relative to the dynamic center
        const fov = 300;
        const scale = fov / p.z;
        const x = centerX + Math.cos(p.angle) * p.radius * scale;
        const y = centerY + Math.sin(p.angle) * p.radius * scale;

        // Draw coherent trail
        // Ensure we have a valid previous position that isn't the respawn flag
        if (p.prevX !== -9999) {
            const dx = x - p.prevX;
            const dy = y - p.prevY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Avoid drawing cross-screen artifacts during reset or huge jumps
            // Increased tolerance slightly as moving center creates larger relative jumps
            if (dist < w * 0.5) {
                const color = colors[p.colorIdx % colors.length];
                // Dynamic size based on proximity (scale) and bass
                const size = p.size * scale * (1 + bass * 2.0);
                
                // Opacity logic: Fade in from distance, solid close up.
                // We rely on the `useRenderLoop` background clearing to create the trailing tail.
                // Drawing a solid segment from prev to current ensures continuity.
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
    // Reset global alpha
    ctx.globalAlpha = 1.0;
  }

  private createParticle(w: number, h: number, z: number, colorCount: number) {
      // Spawn in a tunnel distribution
      const angle = Math.random() * Math.PI * 2;
      // Radius in world units
      const spread = Math.max(w, h);
      const radius = Math.random() * spread * 1.5 + spread * 0.1; 

      return { 
          angle,
          radius, 
          z, 
          speedOffset: 0.5 + Math.random(), // Parallax speed variance
          prevX: -9999, // Flag for "new particle, do not draw line to here"
          prevY: -9999,
          size: 0.5 + Math.random() * 1.5,
          colorIdx: Math.floor(Math.random() * colorCount)
      };
  }
}

export class NebulaRenderer implements IVisualizerRenderer {
  private particles: Array<{ 
    x: number; y: number; vx: number; vy: number; 
    life: number; maxLife: number; size: number; 
    colorIndex: number; rotation: number; rotationSpeed: number; 
    depth: number; // For parallax
  }> = [];
  private spriteCache: Record<string, HTMLCanvasElement> = {};

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
    
    // More complex sprite for a wispier, gaseous look
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
    // Parallax effect: depth determines size, speed, and alpha
    p.depth = Math.random() * 0.6 + 0.4; // 0.4 (far) to 1.0 (near)
    p.size = (w * 0.2) * p.depth + (Math.random() * w * 0.2);
  }

  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    
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
        p.life += settings.speed * p.depth; // Deeper particles live longer/move slower
        
        // Cosmic Wind & Vortex: Particles are drawn towards a moving center point.
        const angleToCenter = Math.atan2(vortexCenterY - p.y, vortexCenterX - p.x);
        
        // Vortex suction increases heavily with bass
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
        // Deeper particles are fainter, flash on bass
        const dynamicAlpha = (0.1 + bass * 0.8) * fadeInOut * settings.sensitivity * p.depth;
        
        if (dynamicAlpha < 0.005) continue;

        const sprite = this.getSprite(colors[p.colorIndex % colors.length] || '#fff'); 
        const finalSize = p.size * (1 + bass * 0.8 * settings.sensitivity);
        
        ctx.globalAlpha = Math.min(0.6, dynamicAlpha); 
        ctx.save(); 
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.rotation); 
        ctx.drawImage(sprite, -finalSize/2, -finalSize/2, finalSize, finalSize); 
        ctx.restore();
    }
    ctx.restore();
  }
}
