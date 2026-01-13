
import { VisualizerMode, Region } from './types';

export const APP_VERSION = '0.2.5'; // 更新版本号

export const GEMINI_MODEL = 'gemini-3-flash-preview';

export const VISUALIZER_PRESETS = {
  [VisualizerMode.PLASMA]: { name: 'Plasma Flow', description: 'Fluid liquid color gradients' },
  [VisualizerMode.BARS]: { name: 'Frequency Bars', description: 'Classic spectrum analyzer' },
  [VisualizerMode.PARTICLES]: { name: 'Starfield', description: 'Particles accelerated by treble' },
  [VisualizerMode.TUNNEL]: { name: 'Geometric Tunnel', description: '3D deep space tunnel' },
  [VisualizerMode.SHAPES]: { name: 'Abstract Shapes', description: 'Dancing geometric primitives' },
  [VisualizerMode.RINGS]: { name: 'Neon Rings', description: 'Concentric circles reactive to mids' },
  [VisualizerMode.NEBULA]: { name: 'Deep Nebula', description: 'Dense, swirling clouds of color' },
  [VisualizerMode.KALEIDOSCOPE]: { name: 'Kaleidoscope', description: 'Psychedelic mandala patterns' },
  [VisualizerMode.LASERS]: { name: 'Concert Lasers', description: 'Converging sweeping light beams' },
  [VisualizerMode.STROBE]: { name: 'Grid Matrix', description: 'Massive LED grid pulsing to the beat' },
  [VisualizerMode.SILK]: { name: 'Silk Waves', description: 'Iridescent flowing fabric (WebGL)' },
  [VisualizerMode.LIQUID]: { name: 'Liquid Sphere', description: 'Ferrofluid-like reactive matter (WebGL)' },
  [VisualizerMode.TERRAIN]: { name: 'Low-Poly Terrain', description: 'Flying over reactive mountains (WebGL)' }
};

/**
 * 优化后的配色方案 - 剔除 3 套重复度较高的配色，保留 22 套独特风格
 */
export const COLOR_THEMES = [
  ['#3b82f6', '#8b5cf6', '#ec4899'], // 赛博朋克 (经典)
  ['#ff00ff', '#00ffff', '#ffff00'], // 极致鲜艳 (高能)
  ['#6366f1', '#a855f7', '#ec4899'], // 极光 (柔和)
  ['#f7ff00', '#db36a4', '#000000'], // 东京霓虹 (对比)
  ['#ff4d00', '#ff00ff', '#00ff4d'], // 幻觉 (迷幻)
  ['#f472b6', '#d946ef', '#8b5cf6'], // 蒸汽波 (粉紫色调)
  ['#2e1065', '#6b21a8', '#d8b4fe'], // 复古浪潮 (深紫色)
  ['#ef4444', '#f59e0b', '#fbbf24'], // 落日 (温暖)
  ['#fcd34d', '#f97316', '#ea580c'], // 岩浆 (炽热)
  ['#f87171', '#dc2626', '#991b1b'], // 血月 (暗红)
  ['#eab308', '#facc15', '#fef08a'], // 黄金时代 (奢华)
  ['#10b981', '#34d399', '#6ee7b7'], // 黑客帝国 (绿黑)
  ['#0ea5e9', '#22d3ee', '#67e8f9'], // 纯净海洋 (浅蓝)
  ['#064e3b', '#059669', '#34d399'], // 翡翠森林 (深绿)
  ['#001219', '#005f73', '#0a9396'], // 深海幽闭 (墨蓝)
  ['#a3e635', '#22c55e', '#14532d'], // 强效绿光 (荧光)
  ['#1a2a6c', '#b21f1f', '#fdbb2d'], // 皇家日落 (三色平衡)
  ['#ee9ca7', '#ffdde1', '#ffffff'], // 樱花 (极简淡红)
  ['#94a3b8', '#e2e8f0', '#f8fafc'], // 银霜 (冷灰)
  ['#000000', '#ffffff', '#cccccc'], // 黑色电影 (黑白)
  ['#111827', '#374151', '#9ca3af'], // 黑曜石 (深灰)
  ['#00ffff', '#3b82f6', '#1d4ed8'], // 电子深蓝 (科技)
];

export const REGION_NAMES: Record<Region, string> = {
  global: 'Global', US: 'USA / West', CN: 'China', JP: 'Japan', KR: 'Korea', EU: 'Europe', LATAM: 'Latin America'
};
