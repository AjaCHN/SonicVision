
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../types';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LowPolyTerrainScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(60, 60, 40, 40), []);

  useFrame(({ clock }) => {
     if (!meshRef.current) return;
     analyser.getByteFrequencyData(dataArray);
     let bass = 0;
     for(let i=0; i<20; i++) bass += dataArray[i];
     bass = (bass/20) * settings.sensitivity;
     const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
     const time = clock.getElapsedTime() * settings.speed;
     for(let i=0; i<positions.count; i++) {
         const x = positions.getX(i);
         const y = positions.getY(i);
         const noiseY = y + time * 5;
         const h = Math.sin(x * 0.2) * Math.cos(noiseY * 0.2) * 2 + Math.sin(x * 0.5 + noiseY * 0.5) * 1;
         const audioH = h * (1 + bass/100);
         positions.setZ(i, audioH);
     }
     positions.needsUpdate = true;
  });

  return (
      <>
        <color attach="background" args={[colors[2] || '#1a1a2e']} />
        <fog attach="fog" args={[colors[2] || '#1a1a2e', 10, 40]} />
        <mesh position={[0, 10, -30]}>
            <circleGeometry args={[8, 32]} />
            <meshBasicMaterial color={colors[0]} />
        </mesh>
        <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -5, 0]}>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial 
                color={colors[1] || '#ffffff'} 
                flatShading={true} 
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 10, -20]} intensity={2} color={colors[0]} />
      </>
  );
};
