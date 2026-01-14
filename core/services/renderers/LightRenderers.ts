
import { IVisualizerRenderer, VisualizerSettings } from '../../types';
import { getAverage } from '../audioUtils';

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
        g.addColorStop(0.2, colors[i % colors.length] || '#fff');
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3 + intensity * 0.7;
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

export class LasersRenderer implements IVisualizerRenderer {
  init() {}
  draw(ctx: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number) {
    if (colors.length === 0) return;
    const highs = getAverage(data, 100, 255) / 255;
    const bass = getAverage(data, 0, 20) / 255;
    const mids = getAverage(data, 20, 80) / 255;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const origins = [{ x: 0, y: h }, { x: w, y: h }, { x: w / 2, y: h + 100 }];
    origins.forEach((origin, oIdx) => {
      for (let i = 0; i < 12; i++) {
        const freqVal = (data[oIdx * 24 + i * 2] || 0) / 255;
        const angleBase = (oIdx === 0 ? -0.2 : oIdx === 1 ? -Math.PI + 0.2 : -Math.PI/2);
        const angle = angleBase + Math.sin(rotation * settings.speed * 0.4 + i * 0.4) * (0.7 + bass * 0.4);
        const length = Math.max(w, h) * 2.5;
        const endX = origin.x + Math.cos(angle) * length;
        const endY = origin.y + Math.sin(angle) * length;
        const finalAlpha = Math.min(Math.max((0.1 + freqVal * 0.9) * settings.sensitivity * (0.4 + bass * 2.5 + highs * 1.5), 0.05), 1.0);
        ctx.beginPath(); const g = ctx.createLinearGradient(origin.x, origin.y, endX, endY);
        g.addColorStop(0, colors[i % colors.length]); g.addColorStop(0.5 + mids * 0.2, colors[i % colors.length]); g.addColorStop(1, 'transparent');
        ctx.strokeStyle = g; ctx.lineWidth = (1.2 + bass * 15 + mids * 5) * settings.sensitivity; ctx.globalAlpha = finalAlpha;
        ctx.moveTo(origin.x, origin.y); ctx.lineTo(endX, endY); ctx.stroke();
      }
    });
    ctx.restore();
  }
}
