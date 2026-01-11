import { VisualizerMode, LyricsStyle, Language, Region } from './types';

export const TRANSLATIONS = {
  en: {
    visualizerMode: 'Visualizer Mode',
    styleTheme: 'Style & Theme',
    settings: 'Settings',
    sensitivity: 'Sensitivity',
    speed: 'Speed',
    glow: 'Glow',
    trails: 'Trails',
    lyrics: 'Lyrics',
    showLyrics: 'Show Lyrics',
    region: 'Music Region',
    startMic: 'Start Microphone',
    listening: 'Listening',
    identifying: 'Identifying Song...',
    startExperience: 'Start Experience',
    welcomeTitle: 'SonicVision AI',
    welcomeText: 'Transform your environment into a visual masterpiece. Enable your microphone to visualize sound and let AI identify the music.',
    hideOptions: 'Hide Options',
    showOptions: 'Show Options',
    reset: 'Reset Defaults',
    randomize: 'Randomize',
    modes: {
      [VisualizerMode.BARS]: 'Frequency Bars',
      [VisualizerMode.RINGS]: 'Neon Rings',
      [VisualizerMode.PARTICLES]: 'Starfield',
      [VisualizerMode.TUNNEL]: 'Geometric Tunnel',
      [VisualizerMode.PLASMA]: 'Plasma Flow',
      [VisualizerMode.SHAPES]: 'Abstract Shapes',
      [VisualizerMode.SMOKE]: 'Ethereal Smoke',
      [VisualizerMode.RIPPLE]: 'Water Ripples'
    },
    lyricsStyles: {
      [LyricsStyle.STANDARD]: 'Standard',
      [LyricsStyle.KARAOKE]: 'Karaoke',
      [LyricsStyle.MINIMAL]: 'Minimal',
      [LyricsStyle.NEON]: 'Neon',
      [LyricsStyle.GLITCH]: 'Glitch',
      [LyricsStyle.TYPEWRITER]: 'Typewriter'
    },
    regions: {
      global: 'Global',
      US: 'USA/West',
      CN: 'China',
      JP: 'Japan',
      KR: 'Korea',
      EU: 'Europe',
      LATAM: 'LatAm'
    },
    unknownSong: 'Unknown',
    ambientNoise: 'Ambient Noise'
  },
  zh: {
    visualizerMode: '可视化模式',
    styleTheme: '样式与主题',
    settings: '高级设置',
    sensitivity: '灵敏度',
    speed: '速度',
    glow: '霓虹光晕',
    trails: '动态拖尾',
    lyrics: '歌词',
    showLyrics: '显示歌词',
    region: '音乐地区',
    startMic: '开启麦克风',
    listening: '监听中',
    identifying: '正在识别歌曲...',
    startExperience: '开始体验',
    welcomeTitle: 'SonicVision AI',
    welcomeText: '将您的环境转化为视觉杰作。开启麦克风以可视化声音，并让 AI 识别音乐。',
    hideOptions: '隐藏选项',
    showOptions: '显示选项',
    reset: '重置默认',
    randomize: '随机组合',
    modes: {
      [VisualizerMode.BARS]: '镜像频谱',
      [VisualizerMode.RINGS]: '霓虹光环',
      [VisualizerMode.PARTICLES]: '星空粒子',
      [VisualizerMode.TUNNEL]: '几何隧道',
      [VisualizerMode.PLASMA]: '流体等离子',
      [VisualizerMode.SHAPES]: '抽象几何',
      [VisualizerMode.SMOKE]: '烟雾特效',
      [VisualizerMode.RIPPLE]: '水波纹'
    },
    lyricsStyles: {
      [LyricsStyle.STANDARD]: '标准',
      [LyricsStyle.KARAOKE]: '卡拉OK',
      [LyricsStyle.MINIMAL]: '极简',
      [LyricsStyle.NEON]: '霓虹',
      [LyricsStyle.GLITCH]: '故障',
      [LyricsStyle.TYPEWRITER]: '打字机'
    },
    regions: {
      global: '全球',
      US: '欧美',
      CN: '中国大陆',
      JP: '日本',
      KR: '韩国',
      EU: '欧洲',
      LATAM: '拉美'
    },
    unknownSong: '未知歌曲',
    ambientNoise: '环境噪音'
  }
};