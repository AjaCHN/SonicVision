
import { IVisualizerRenderer, VisualizerSettings, RenderContext } from '../../types/index';

export class RingsRenderer implements IVisualizerRenderer {
  private beatScale = 1.0;

  init() { this.beatScale = 1.0; }
  
  draw(ctx: RenderContext, data: Uint8Array, w: number, h: number, colors: string[], settings: VisualizerSettings, rotation: number, beat: boolean) {
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRings = 15;
    const minDimension = Math.min(w, h);
    
    // Beat Reaction Logic
    if (beat) this.beatScale = 1.2;
    this.beatScale += (1.0 - this.beatScale) * 0.1; // Decay

    const scale = Math.max(0.6, minDimension / 800) * this.beatScale; 

    if (colors.length === 0) return;
    for(let i = 0; i < maxRings; i++) {
        const freqIndex = i * 8; 
        const val = data[freqIndex] * settings.sensitivity;
        const baseR = (40 + (i * 25)) * scale;
        const audioR = Math.min(val, 150) * Math.min(scale, 1.5); 
        const radius = baseR + audioR;
        ctx.beginPath();
        ctx.strokeStyle = colors[i % colors.length];
        
        // Boost linewidth on beat
        const beatWidthBoost = beat ? 5 : 0;
        ctx.lineWidth = ((2 + (val / 40)) * settings.sensitivity + beatWidthBoost) * scale;
        
        const startAngle = rotation * (i % 2 === 0 ? 1 : -1) + i; 
        const endAngle = startAngle + (Math.PI * 1.5) + (val / 255); 
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
    }
  }
}
