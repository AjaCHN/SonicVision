
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';
import { DynamicStarfield } from './DynamicStarfield'; // Importing DynamicStarfield

// Fix for missing JSX types in R3F
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LowPolyTerrainScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  const { bass, mids, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const geometry = useMemo(() => {
    // Standard terrain segments
    const segments = settings.quality === 'high' ? 60 : settings.quality === 'med' ? 40 : 30;
    // Larger plane for infinite feel
    return new THREE.PlaneGeometry(120, 120, segments, segments);
  }, [settings.quality]);

  useFrame(({ clock }) => {
     // Modulate speed with bass to give a "turbo boost" feeling on kicks
     const time = clock.getElapsedTime() * settings.speed;

     if (materialRef.current) materialRef.current.color = c1;
     
     if (fogRef.current) {
        fogRef.current.color = c2;
        // Fog breathes with the music
        fogRef.current.near = 15 - bass * 5;
        fogRef.current.far = 90;
     }

     // Reactive lighting
     if (dirLightRef.current) {
        dirLightRef.current.color = c0;
        dirLightRef.current.intensity = 1.5 + bass * 2.0; // Flash on beat
     }
     if (ambientLightRef.current) {
        ambientLightRef.current.color = c1;
        ambientLightRef.current.intensity = 0.2 + mids * 0.5;
     }

     if (!meshRef.current) return;
     const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;

     // Amplifiers
     const bassAmp = bass * 12.0; 
     const midAmp = mids * 4.0;
     
     // Global terrain pulse
     const breathing = 1.0 + bass * 0.2;

     for(let i=0; i<positions.count; i++) {
         const x = positions.getX(i);
         const y = positions.getY(i);

         // Diversified movement logic:
         // 1. Forward movement (Y-axis) - faster on beat
         const flowY = y - (time * 10);
         // 2. Lateral drift (X-axis) - simulates a meandering path
         const driftX = Math.sin(time * 0.15) * 15;
         const flowX = x + driftX;

         // Mountain Noise Generation with diversified coordinates
         const noise1 = Math.sin(flowX * 0.08 + flowY * 0.06);
         const noise2 = Math.sin(flowX * 0.2 + flowY * 0.15) * 0.5;
         
         // Audio ripple - originates from center
         const dist = Math.sqrt(x*x + y*y);
         const ripple = Math.sin(dist * 0.3 - time * 5) * treble * 1.5;

         let h = (noise1 * 5 + noise2 * midAmp) * breathing + ripple;

         // Safety Valley: Flatten geometry at X=0 (Camera path)
         const distFromCenter = Math.abs(x);
         const valleyWidth = 12;
         let valleyFactor = (distFromCenter - 4) / valleyWidth;
         valleyFactor = Math.max(0, Math.min(1, valleyFactor)); 
         
         h *= valleyFactor;
         
         // Ridge effect - Spikes grow with bass
         const finalHeight = Math.abs(h) + (valleyFactor * bassAmp * 0.6 * Math.sin(x * 0.5));
         
         positions.setZ(i, finalHeight);
     }
     positions.needsUpdate = true;
     meshRef.current.geometry.computeVertexNormals();
  });

  return (
      <>
        <color attach="background" args={[c2.getStyle()]} /> 
        <fog ref={fogRef} attach="fog" args={[c2.getStyle(), 20, 90]} />
        <DynamicStarfield treble={treble} speed={settings.speed} />
        
        {/* 
           Standard Terrain Rotation: -90deg on X to lay flat. 
           Position: Lowered Y (-6) to clear camera at Y=2. 
           Pushed back Z (-20) to cover frustum.
        */}
        <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -6, -20]}>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial 
                ref={materialRef}
                flatShading={true} 
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
        
        <ambientLight ref={ambientLightRef} intensity={0.2} color={c1} />
        <directionalLight 
            ref={dirLightRef}
            color={c0} 
            intensity={1.5} 
            position={[0, 20, -10]}
        />
        {/* Rim light from below/front */}
        <pointLight position={[0, -5, 10]} intensity={1} color={c1} distance={60} />
      </>
  );
};
