
import React, { useRef, useEffect } from 'react';
import { VisualizerMode, VisualizerSettings } from '../../core/types/index';
import { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, BeatDetector 
} from '../../core/services/visualizerStrategies';

interface VisualizerCanvasProps {
  analyser: AnalyserNode | null;
  mode: VisualizerMode;
  colors: string[];
  settings: VisualizerSettings;
}

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ 
  analyser, mode, colors, settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderersRef = useRef<any>({});
  // Use inferred type for BeatDetector ref to avoid potential type mismatch issues
  const beatDetectorRef = useRef(new BeatDetector());
  const requestRef = useRef<number>(0); // Initialize with 0
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    // Initialize renderers
    renderersRef.current = {
      [VisualizerMode.BARS]: new BarsRenderer(),
      [VisualizerMode.RINGS]: new RingsRenderer(),
      [VisualizerMode.PARTICLES]: new ParticlesRenderer(),
      [VisualizerMode.TUNNEL]: new TunnelRenderer(),
      [VisualizerMode.PLASMA]: new PlasmaRenderer(),
      [VisualizerMode.NEBULA]: new NebulaRenderer(),
      [VisualizerMode.LASERS]: new LasersRenderer(),
      [VisualizerMode.FLUID_CURVES]: new FluidCurvesRenderer(),
      [VisualizerMode.MACRO_BUBBLES]: new MacroBubblesRenderer(),
    };
    
    Object.values(renderersRef.current).forEach((r: any) => r.init && r.init());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      // Handle resize
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const width = canvas.width;
      const height = canvas.height;

      analyser.getByteFrequencyData(dataArray);
      
      const isBeat = beatDetectorRef.current.detect(dataArray);
      rotationRef.current += 0.005 * settings.speed;

      // Clear or Trails
      if (settings.trails) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const renderer = renderersRef.current[mode];
      if (renderer) {
        try {
          renderer.draw(ctx, dataArray, width, height, colors, settings, rotationRef.current, isBeat);
        } catch (e) {
          console.error("Renderer error:", e);
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, mode, colors, settings]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none bg-black overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
    </div>
  );
};

export default VisualizerCanvas;
