import { VisualizerMode, Region } from './types';

// Using Pro model for maximum accuracy in audio analysis
export const GEMINI_MODEL = 'gemini-3-pro-preview';

export const VISUALIZER_PRESETS = {
  [VisualizerMode.BARS]: {
    name: 'Frequency Bars',
    description: 'Classic spectrum analyzer'
  },
  [VisualizerMode.PLASMA]: {
    name: 'Plasma Flow',
    description: 'Fluid liquid color gradients'
  },
  [VisualizerMode.PARTICLES]: {
    name: 'Starfield',
    description: 'Particles accelerated by treble'
  },
  [VisualizerMode.TUNNEL]: {
    name: 'Geometric Tunnel',
    description: '3D deep space tunnel'
  },
  [VisualizerMode.SHAPES]: {
    name: 'Abstract Shapes',
    description: 'Dancing geometric primitives'
  },
  [VisualizerMode.RINGS]: {
    name: 'Neon Rings',
    description: 'Concentric circles reactive to mids'
  },
  [VisualizerMode.SMOKE]: {
    name: 'Ethereal Smoke',
    description: 'Drifting colorful fog'
  },
  [VisualizerMode.RAIN]: {
    name: 'Digital Rain',
    description: 'Matrix-style falling code'
  },
  [VisualizerMode.KALEIDOSCOPE]: {
    name: 'Kaleidoscope',
    description: 'Psychedelic mandala patterns'
  },
  [VisualizerMode.CITY]: {
    name: 'EQ City',
    description: 'Skyline reacting to frequencies'
  },
  [VisualizerMode.SINGULARITY]: {
    name: 'The Singularity',
    description: 'Event horizon with accretion disk (WebGL)'
  },
  [VisualizerMode.SILK]: {
    name: 'Silk Waves',
    description: 'Iridescent flowing fabric (WebGL)'
  },
  [VisualizerMode.LIQUID]: {
    name: 'Liquid Sphere',
    description: 'Ferrofluid-like reactive matter (WebGL)'
  },
  [VisualizerMode.TERRAIN]: {
    name: 'Low Poly Terrain',
    description: 'Flying over reactive mountains (WebGL)'
  }
};

export const COLOR_THEMES = [
  ['#ef4444', '#f59e0b', '#fbbf24'], // Sunset
  ['#3b82f6', '#8b5cf6', '#ec4899'], // Cyberpunk
  ['#10b981', '#34d399', '#6ee7b7'], // Matrix
  ['#64748b', '#475569', '#1e293b'], // Dark Slate / Gunmetal
  ['#0ea5e9', '#22d3ee', '#67e8f9'], // Ocean
  ['#f472b6', '#d946ef', '#8b5cf6'], // Vaporwave
  ['#eab308', '#facc15', '#fef08a'], // Golden Hour
  ['#6366f1', '#a855f7', '#ec4899'], // Aurora
];

export const REGION_NAMES: Record<Region, string> = {
  global: 'Global',
  US: 'USA / West',
  CN: 'China',
  JP: 'Japan',
  KR: 'Korea',
  EU: 'Europe',
  LATAM: 'Latin America'
};