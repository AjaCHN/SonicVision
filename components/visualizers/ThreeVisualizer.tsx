
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, TiltShift } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerMode, VisualizerSettings } from '../../types';
import { SilkWavesScene, LiquidSphereScene, LowPolyTerrainScene } from './ThreeScenes';

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; 
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  if (!analyser) return null;

  const renderScene = () => {
    switch (mode) {
        case VisualizerMode.SILK:
            return <SilkWavesScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.LIQUID:
            return <LiquidSphereScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.TERRAIN:
            return <LowPolyTerrainScene analyser={analyser} colors={colors} settings={settings} />;
        default:
            return <LowPolyTerrainScene analyser={analyser} colors={colors} settings={settings} />;
    }
  };

  const getBloomIntensity = () => {
      if (mode === VisualizerMode.SILK) return 1.5; // Reduced slightly
      if (mode === VisualizerMode.LIQUID) return 2.0;
      return 2.0;
  };

  // Performance Optimization: Cap DPR to prevent overheating on high-res mobile screens
  const dpr = settings.quality === 'low' ? 0.8 : settings.quality === 'med' ? 1.2 : Math.min(window.devicePixelRatio, 2);

  // Performance Optimization: Selective Post-Processing
  const enableTiltShift = settings.quality === 'high' && (mode === VisualizerMode.LIQUID || mode === VisualizerMode.SILK);
  const enableChromatic = settings.quality !== 'low'; // Disable chromatic aberration on low end

  return (
    <div className={`absolute inset-0 z-0 ${settings.hideCursor ? 'cursor-none' : ''}`}>
      <Canvas 
        camera={{ position: [0, 2, 15], fov: 60 }} 
        dpr={dpr} 
        gl={{ 
            antialias: false, 
            toneMapping: THREE.ReinhardToneMapping, 
            preserveDrawingBuffer: true, 
            autoClear: true,
            powerPreference: "high-performance"
        }}
      >
        {renderScene()}
        {settings.glow && (
            <EffectComposer enableNormalPass={false} multisampling={0}>
                {/* Optimized Bloom: Threshold raised to 0.5 to process fewer pixels. */}
                <Bloom 
                    luminanceThreshold={0.5} 
                    luminanceSmoothing={0.8} 
                    intensity={getBloomIntensity()} 
                    mipmapBlur={settings.quality !== 'low'} // Disable mipmap blur on low for speed
                />
                {enableChromatic && (
                    <ChromaticAberration 
                        offset={new THREE.Vector2(0.002 * settings.sensitivity, 0.002)}
                        radialModulation={false}
                        modulationOffset={0}
                    />
                )}
                {enableTiltShift && (
                    <TiltShift blur={0.1} />
                )}
            </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;
