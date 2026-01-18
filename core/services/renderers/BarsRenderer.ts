
import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';

export class BarsRenderer implements IVisualizerRenderer {
  init() {}

  // Helper for rounded rectangles
  private drawRoundedRect(ctx: RenderContext, x: number, y: number, width: number, height: number, radius: number) {
    if (height < 0) height = 0;
    if (width < 0) width = 0;
    if (height < 2 * radius) radius = height / 2;
    if (width < 2 * radius) radius = width / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    const barCount = 56;
    const step = Math.floor(data.length / (barCount * 1.5));
    const barWidth = (w / barCount) * 0.6;
    const barSpacing = (w / barCount) * 0.4;
    const centerX = w / 2;
    const c0 = colors[0] || '#ffffff';
    const c1 = colors[1] || c0;

    for (let i = 0; i < barCount / 2; i++) {
        const value = data[i * step] * settings.sensitivity * 1.2;
        const barHeight = Math.min(Math.max((value / 255) * h * 0.7, 0), h * 0.85);
        
        const capHeight = 4;
        const cornerRadius = barWidth * 0.3;

        if (barHeight <= capHeight) continue;

        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.8, c0);
        gradient.addColorStop(1, c0);

        const totalBarWidth = barWidth + barSpacing;
        const x_right = centerX + i * totalBarWidth + barSpacing / 2;
        const y = (h - barHeight) / 2;
        const x_left = centerX - (i * totalBarWidth) - barWidth - barSpacing / 2;
        
        // Draw main bar body
        ctx.fillStyle = gradient;
        this.drawRoundedRect(ctx, x_right, y + capHeight, barWidth, barHeight - capHeight, cornerRadius);
        this.drawRoundedRect(ctx, x_left, y + capHeight, barWidth, barHeight - capHeight, cornerRadius);

        // Draw cap
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.drawRoundedRect(ctx, x_right, y, barWidth, capHeight, 2);
        this.drawRoundedRect(ctx, x_left, y, barWidth, capHeight, 2);
    }
  }
}
