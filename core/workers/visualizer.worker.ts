/**
 * Aura Vision - Visualizer Worker
 * Version: 1.0.0
 *
 * This worker script is responsible for offloading 2D visualizer rendering
 * from the main thread using OffscreenCanvas. It imports all necessary
 * rendering strategies and audio analysis tools.
 */

// --- 1. IMPORT DEPENDENCIES ---
import { VisualizerMode, VisualizerSettings, WorkerMessage, IVisualizerRenderer } from '../types';
import { BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, LasersRenderer, BeatDetector } from '../services/visualizerStrategies';

// --- 2. WORKER MAIN LOGIC ---

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0, height = 0;
let currentMode: VisualizerMode = VisualizerMode.PLASMA;
let currentSettings: VisualizerSettings | null = null;
let currentColors: string[] = ['#ffffff'];
let lastFrameData: Uint8Array | null = null;
let rotation = 0;

// Instantiate renderers
const renderers: Partial<Record<VisualizerMode, IVisualizerRenderer>> = {
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

const beatDetector = new BeatDetector();

const loop = () => {
  if (!ctx || !currentSettings) {
    requestAnimationFrame(loop);
    return;
  };

  const smoothColors = currentColors; 
  
  if (currentSettings.trails) {
    ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  rotation += 0.005 * currentSettings.speed;
  const data = lastFrameData || new Uint8Array(0);
  const isBeat = data.length > 0 ? beatDetector.detect(data) : false;

  const renderer = renderers[currentMode];
  if (renderer) {
    try {
      renderer.draw(ctx, data, width, height, smoothColors, currentSettings, rotation, isBeat);
    } catch (e: any) {
      console.error(`[Worker] Renderer ${currentMode} failed:`, e.message);
      // Failsafe: switch to a basic renderer to prevent crash loop
      currentMode = VisualizerMode.PLASMA;
    }
  }

  requestAnimationFrame(loop);
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'INIT':
      canvas = msg.canvas;
      width = msg.width;
      height = msg.height;
      ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) as OffscreenCanvasRenderingContext2D;
      // Initialize all renderers (some might not use canvas but need to setup state)
      Object.values(renderers).forEach(r => r?.init(canvas));
      loop();
      break;
    case 'RESIZE':
      width = msg.width;
      height = msg.height;
      if (canvas) { canvas.width = width; canvas.height = height; }
      break;
    case 'CONFIG':
      if(currentMode !== msg.mode) {
        // Clear canvas on mode switch to prevent artifacts
        if(ctx) ctx.clearRect(0,0,width,height);
      }
      currentMode = msg.mode;
      currentSettings = msg.settings;
      currentColors = msg.colors;
      break;
    case 'FRAME':
      lastFrameData = msg.data;
      break;
  }
};