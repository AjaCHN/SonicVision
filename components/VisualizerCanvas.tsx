import React, { useEffect, useRef } from 'react';
import { VisualizerMode, VisualizerSettings } from '../types';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  colors: string[];
  settings: VisualizerSettings;
}

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ analyser, mode, colors, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // State Refs for specific modes
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number, size: number}>>([]);
  const rotationRef = useRef<number>(0); // For rotating elements
  
  // New Refs for added modes
  const smokeParticlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, size: number, alpha: number, color: string, life: number, maxLife: number}>>([]);
  const ripplesRef = useRef<Array<{x: number, y: number, radius: number, maxRadius: number, alpha: number, speed: number, color: string}>>([]);

  const draw = () => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Setup canvas
    const width = canvas.width;
    const height = canvas.height;

    // Handle Trails (Motion Blur) vs Clear
    let alpha = 0.2;
    if (mode === VisualizerMode.PLASMA) alpha = 0.1; 
    if (mode === VisualizerMode.PARTICLES) alpha = 0.3; 
    if (mode === VisualizerMode.SMOKE) alpha = 0.1; // Slightly higher alpha to allow smoke to blend naturally without becoming too thick too fast

    if (settings.trails) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`; 
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.clearRect(0, 0, width, height);
    }
    
    // Handle Glow
    if (settings.glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[0];
    } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    // Get Data (All remaining modes use Frequency Data)
    analyser.getByteFrequencyData(dataArray);

    // Update global rotation for some effects
    rotationRef.current += 0.005 * settings.speed;

    // Drawing Logic
    switch (mode) {
      case VisualizerMode.BARS:
        drawMirroredBars(ctx, dataArray, width, height, colors, bufferLength, settings);
        break;
      case VisualizerMode.RINGS:
        drawRings(ctx, dataArray, width, height, colors, bufferLength, settings, rotationRef.current);
        break;
      case VisualizerMode.PARTICLES:
        drawParticles(ctx, dataArray, width, height, colors, bufferLength, particlesRef.current, settings, rotationRef.current);
        break;
      case VisualizerMode.TUNNEL:
        drawGeometricTunnel(ctx, dataArray, width, height, colors, bufferLength, settings, rotationRef.current);
        break;
      case VisualizerMode.PLASMA:
        drawPlasmaFlow(ctx, dataArray, width, height, colors, bufferLength, settings, rotationRef.current);
        break;
      case VisualizerMode.SHAPES:
        drawAbstractShapes(ctx, dataArray, width, height, colors, bufferLength, settings, rotationRef.current);
        break;
      case VisualizerMode.SMOKE:
        drawSmoke(ctx, dataArray, width, height, colors, bufferLength, smokeParticlesRef.current, settings);
        break;
      case VisualizerMode.RIPPLE:
        drawRipples(ctx, dataArray, width, height, colors, bufferLength, ripplesRef.current, settings);
        break;
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, mode, colors, settings]); 

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

// --- Drawing Helpers ---

function drawMirroredBars(
  ctx: CanvasRenderingContext2D, 
  data: Uint8Array, 
  w: number, 
  h: number, 
  colors: string[], 
  bufferLength: number,
  settings: VisualizerSettings
) {
  const barCount = 64; 
  const step = Math.floor(bufferLength / barCount); 
  const barWidth = (w / barCount) / 2; 
  
  const centerX = w / 2;

  for (let i = 0; i < barCount; i++) {
    const value = data[i * step] * settings.sensitivity;
    const barHeight = Math.min((value / 255) * h * 0.8, h * 0.9);
    
    const gradient = ctx.createLinearGradient(0, h/2 + barHeight/2, 0, h/2 - barHeight/2);
    gradient.addColorStop(0, colors[1]);
    gradient.addColorStop(0.5, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    ctx.fillStyle = gradient;

    // Draw Right Side
    ctx.fillRect(centerX + (i * barWidth), (h - barHeight) / 2, barWidth - 2, barHeight);
    
    // Draw Left Side
    ctx.fillRect(centerX - ((i + 1) * barWidth), (h - barHeight) / 2, barWidth - 2, barHeight);
  }
}

function drawRings(
  ctx: CanvasRenderingContext2D, 
  data: Uint8Array, 
  w: number, 
  h: number, 
  colors: string[], 
  bufferLength: number,
  settings: VisualizerSettings,
  rotation: number
) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  const maxRings = 15;
  
  for(let i = 0; i < maxRings; i++) {
      const freqIndex = i * 8; 
      const val = data[freqIndex] * settings.sensitivity;
      
      const baseR = 30 + (i * 20);
      const offset = Math.min(val, 100);
      const radius = baseR + offset;
      
      ctx.beginPath();
      ctx.strokeStyle = colors[i % colors.length];
      
      ctx.lineWidth = (2 + (val / 40)) * settings.sensitivity;
      
      const startAngle = rotation * (i % 2 === 0 ? 1 : -1) + i; 
      const endAngle = startAngle + (Math.PI * 1.5) + (val / 255); 

      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D, 
  data: Uint8Array, 
  w: number, 
  h: number, 
  colors: string[], 
  bufferLength: number,
  particles: Array<{x: number, y: number, vx: number, vy: number, life: number, size: number}>,
  settings: VisualizerSettings,
  rotation: number
) {
    // Dynamic Center Point Calculation
    // Use rotation as a time factor. 
    const time = rotation * 0.8;
    // Drift range is approx 20% of width and 15% of height
    const driftX = Math.sin(time) * (w * 0.2); 
    const driftY = Math.cos(time * 1.3) * (h * 0.15); 

    const centerX = w / 2 + driftX;
    const centerY = h / 2 + driftY;

    let bass = 0;
    for(let i=0; i<10; i++) bass += data[i];
    bass = (bass / 10) / 255; 
    
    let mids = 0;
    for(let i=10; i<50; i++) mids += data[i];
    mids = (mids / 40) / 255;

    if (settings.glow) {
        ctx.save();
        const maxRadius = Math.max(w, h);
        const nebulaRadius = maxRadius * 0.4 + (bass * maxRadius * 0.3 * settings.sensitivity);
        const nebulaColor = colors[1];
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nebulaRadius);
        
        ctx.globalAlpha = 0.2 + (bass * 0.3);
        gradient.addColorStop(0, nebulaColor);
        gradient.addColorStop(0.5, colors[2] || colors[0]);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    const maxParticles = 200;
    
    if (particles.length < maxParticles) {
        const count = 5;
        for(let i=0; i<count; i++) {
            particles.push({
                x: (Math.random() - 0.5) * w * 2, 
                y: (Math.random() - 0.5) * h * 2,
                life: w * (Math.random() * 0.5 + 0.5), 
                vx: w, 
                vy: 0, 
                size: Math.random() * 2 + 0.5
            });
        }
    }

    const warpSpeed = (0.5 + (mids * 40)) * settings.speed * settings.sensitivity;

    ctx.fillStyle = '#fff';
    
    const fieldRotation = rotation * 0.3;

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (Math.abs(p.x) > w * 2 || Math.abs(p.y) > h * 2) {
             p.life = -1; 
        }

        const prevZ = p.life;
        p.vx = prevZ; 
        
        p.life -= warpSpeed;

        if (p.life <= 10 || p.x === 0 || p.y === 0) {
            p.x = (Math.random() - 0.5) * w * 2;
            p.y = (Math.random() - 0.5) * h * 2;
            p.life = w;
            p.vx = w;
            p.size = Math.random() * 2 + 0.5;
            continue;
        }

        const fov = 250;
        const scale = fov / p.life;
        const prevScale = fov / p.vx;
        
        const cosR = Math.cos(fieldRotation);
        const sinR = Math.sin(fieldRotation);
        const rotX = p.x * cosR - p.y * sinR;
        const rotY = p.x * sinR + p.y * cosR;

        const sx = centerX + rotX * scale;
        const sy = centerY + rotY * scale;
        
        const prevSx = centerX + rotX * prevScale;
        const prevSy = centerY + rotY * prevScale;

        const size = p.size * scale;

        let alpha = 1;
        if (p.life > w * 0.8) alpha = (w - p.life) / (w * 0.2); 
        if (p.life < 50) alpha = p.life / 50; 

        const colorIndex = Math.floor(Math.random() * colors.length); 
        ctx.fillStyle = (warpSpeed > 10) ? colors[colorIndex] : '#ffffff';
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        
        const dist = Math.sqrt(Math.pow(sx - prevSx, 2) + Math.pow(sy - prevSy, 2));
        
        if (dist > size * 2 && settings.trails) {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.moveTo(prevSx, prevSy);
            ctx.lineTo(sx, sy);
            ctx.stroke();
        } else {
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.globalAlpha = 1.0;
}

function drawGeometricTunnel(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    w: number,
    h: number,
    colors: string[],
    bufferLength: number,
    settings: VisualizerSettings,
    rotation: number
) {
    const centerX = w / 2;
    const centerY = h / 2;
    
    const shapes = 12;
    const maxRadius = Math.max(w, h) * 0.7;

    let energy = 0;
    for(let i=0; i<100; i++) energy += data[i];
    energy = (energy / 100) * settings.sensitivity;

    ctx.save();
    ctx.translate(centerX, centerY);
    
    for (let i = 0; i < shapes; i++) {
        const dataIndex = Math.floor((i / shapes) * 40); 
        const value = data[dataIndex] * settings.sensitivity;
        
        const depth = (i + (rotation * 5)) % shapes; 
        const scale = Math.pow(depth / shapes, 2); 

        const radius = maxRadius * scale * (1 + (value / 500)); 
        const rotationOffset = rotation * (i % 2 === 0 ? 1 : -1) + (depth * 0.2);

        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = (2 + (scale * 30)) * settings.sensitivity;
        ctx.globalAlpha = scale; 

        ctx.beginPath();
        const sides = 6; 
        for (let j = 0; j <= sides; j++) {
            const angle = (j / sides) * Math.PI * 2 + rotationOffset;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawPlasmaFlow(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    w: number,
    h: number,
    colors: string[],
    bufferLength: number,
    settings: VisualizerSettings,
    rotation: number
) {
    const blobs = 6; 
    
    const getRangeAverage = (start: number, end: number) => {
        let sum = 0;
        for(let i=start; i<end; i++) sum += data[i];
        return sum / (end - start);
    }

    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < blobs; i++) {
        // Blobs correspond to different frequency bands
        let rangeAvg = 0;
        if (i < 2) rangeAvg = getRangeAverage(0, 10); // Bass
        else if (i < 4) rangeAvg = getRangeAverage(10, 80); // Mids
        else rangeAvg = getRangeAverage(80, 200); // Highs

        const intensity = (rangeAvg / 255) * settings.sensitivity;

        const speed = (0.2 + (i * 0.1)) * settings.speed;
        
        // Lissajous curves
        const t = rotation * speed + (i * Math.PI / 3);
        const xOffset = Math.sin(t) * (w * 0.4) * Math.cos(t * 0.5);
        const yOffset = Math.cos(t * 0.8) * (h * 0.4) * Math.sin(t * 0.3);
        
        const x = w/2 + xOffset;
        const y = h/2 + yOffset;
        
        const minDim = Math.min(w, h);
        
        // Size logic: Breathing + Audio Pulse
        const breathing = Math.sin(rotation * 2 + i) * 0.1;
        const audioPulse = intensity * 0.5; 
        
        // Vary base size
        const baseSizeRatio = 0.15 + (i % 3) * 0.05; 
        
        const rawRadius = minDim * (baseSizeRatio + breathing + audioPulse);
        const radius = Math.max(minDim * 0.05, rawRadius); 
        
        const color = colors[i % colors.length];
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Intensity drives alpha
        const alpha = Math.min(1.0, 0.3 + intensity * 0.5);
        
        gradient.addColorStop(0, '#ffffff'); 
        gradient.addColorStop(0.3, color); 
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
}

function drawAbstractShapes(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    w: number,
    h: number,
    colors: string[],
    bufferLength: number,
    settings: VisualizerSettings,
    rotation: number
) {
    const centerX = w / 2;
    const centerY = h / 2;

    const bass = getAverage(data, 0, 10) * settings.sensitivity;
    const mids = getAverage(data, 10, 50) * settings.sensitivity;
    const treble = getAverage(data, 50, 100) * settings.sensitivity;

    ctx.lineWidth = 4;

    // 1. Central Bass Triangle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation); 
    const triSize = 50 + bass * 1.5;
    ctx.strokeStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(0, -triSize);
    ctx.lineTo(triSize * 0.866, triSize * 0.5);
    ctx.lineTo(-triSize * 0.866, triSize * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 2. Orbiting Mids Squares
    const orbitCount = 4;
    for(let i=0; i<orbitCount; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const orbitAngle = rotation * -0.5 + (i * (Math.PI * 2 / orbitCount));
        const orbitRadius = 150 + mids * 0.5;
        
        const x = Math.cos(orbitAngle) * orbitRadius;
        const y = Math.sin(orbitAngle) * orbitRadius;
        
        ctx.translate(x, y);
        ctx.rotate(rotation * 2 + i); 
        
        const sqSize = 20 + mids * 0.4;
        ctx.strokeStyle = colors[1];
        ctx.strokeRect(-sqSize/2, -sqSize/2, sqSize, sqSize);
        ctx.restore();
    }

    // 3. Treble Circles 
    const circCount = 8;
    for(let i=0; i<circCount; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const angle = rotation * 0.2 + (i * (Math.PI * 2 / circCount));
        const dist = 250 + treble * 0.2 + (i%2 * 50); 
        
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        
        const r = 5 + treble * 0.2;
        
        ctx.fillStyle = colors[2];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawSmoke(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    w: number,
    h: number,
    colors: string[],
    bufferLength: number,
    smokeParticles: Array<{x: number, y: number, vx: number, vy: number, size: number, alpha: number, color: string, life: number, maxLife: number}>,
    settings: VisualizerSettings
) {
    // Volume determines spawn rate
    let volume = 0;
    for(let i=0; i<bufferLength; i++) volume += data[i];
    volume = (volume / bufferLength) * settings.sensitivity;

    // Turbulence from mids/highs for wind effect
    let turbulence = 0;
    for(let i=50; i<150; i++) turbulence += data[i];
    turbulence /= 100;

    // Continuous spawn logic based on volume
    // Always spawn some, spawn more on loud volume
    const spawnCount = 1 + Math.floor(volume / 30);
    const maxSmoke = 120; // Limit total particles

    if (smokeParticles.length < maxSmoke) {
        for(let i=0; i<spawnCount; i++) {
            const x = Math.random() * w;
            const y = h + 20; // Start below screen
            
            // Color variation based on theme
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 30 + Math.random() * 40;
            const maxLife = 200 + Math.random() * 100;
            
            smokeParticles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 1.5, // Slight drift
                vy: -0.5 - (Math.random() * 1.5) * settings.speed, // Slower, varied rise
                size,
                alpha: 0, // Start invisible and fade in
                color,
                life: 0,
                maxLife
            });
        }
    }

    // Use Screen blending for ethereal light effect
    ctx.globalCompositeOperation = 'screen';

    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        
        p.life++;
        
        // Fade In / Out Logic
        const fadeInDur = 50;
        const fadeOutDur = 50;
        
        if (p.life < fadeInDur) {
             p.alpha = (p.life / fadeInDur) * 0.4; // Max opacity 0.4
        } else if (p.life > p.maxLife - fadeOutDur) {
             p.alpha = ((p.maxLife - p.life) / fadeOutDur) * 0.4;
        }

        // Physics
        // Add sinusoidal drift based on Y height to simulate wind currents
        // Turbulence adds noise to the sine wave frequency
        const wind = Math.sin(p.y * 0.01 + performance.now() * 0.001) * (0.5 + turbulence/50);
        
        p.x += p.vx + wind;
        p.y += p.vy;
        p.size += 0.3 * settings.speed; // Expand as it rises

        if (p.life >= p.maxLife || p.y < -p.size || p.alpha <= 0.01) {
            smokeParticles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = Math.max(0, p.alpha);
        
        // Draw soft gradient "puff"
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color); // Core color
        gradient.addColorStop(1, 'transparent'); // Soft edge
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset context
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
}

function drawRipples(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    w: number,
    h: number,
    colors: string[],
    bufferLength: number,
    ripples: Array<{x: number, y: number, radius: number, maxRadius: number, alpha: number, speed: number, color: string}>,
    settings: VisualizerSettings
) {
    // Detect Bass Kick
    let bass = 0;
    for(let i=0; i<10; i++) bass += data[i];
    bass /= 10;
    
    // Threshold for spawning ripple
    if (bass > 180 / settings.sensitivity) {
        // Don't spawn too many
        if (ripples.length < 15 && Math.random() > 0.5) {
             const x = Math.random() * w;
             const y = Math.random() * h;
             const color = colors[Math.floor(Math.random() * colors.length)];
             
             ripples.push({
                 x,
                 y,
                 radius: 1,
                 maxRadius: Math.min(w, h) * (0.2 + (bass/255) * 0.3),
                 alpha: 1.0,
                 speed: 2 * settings.speed + (bass/50),
                 color
             });
        }
    }
    
    // Center ripple for continuous sound
    if (bass > 100) {
       if (ripples.length < 20 && Math.random() > 0.9) {
          ripples.push({
               x: w/2,
               y: h/2,
               radius: 1,
               maxRadius: Math.min(w, h) * 0.5,
               alpha: 0.8,
               speed: 3 * settings.speed,
               color: colors[0]
           });
       }
    }

    ctx.lineWidth = 2;

    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        
        r.radius += r.speed;
        r.alpha -= 0.01;

        if (r.alpha <= 0 || r.radius > r.maxRadius) {
            ripples.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
}

function getAverage(data: Uint8Array, start: number, end: number) {
    let sum = 0;
    for(let i=start; i<end; i++) sum += data[i];
    return sum / (end - start);
}

export default VisualizerCanvas;