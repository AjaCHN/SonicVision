
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { VisualizerSettings } from '../../types';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LiquidSphereScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  
  // Optimized: Reduce polyhedron detail based on quality
  // Detail 3 = High vertex count (~640 faces)
  // Detail 2 = Medium (~320 faces)
  // Detail 1 = Low (~80 faces) - creates a cool low-poly look for low-end devices
  const geometry = useMemo(() => {
      let detail = 1;
      if (settings.quality === 'med') detail = 2;
      if (settings.quality === 'high') detail = 3;
      return new THREE.IcosahedronGeometry(4, detail);
  }, [settings.quality]);
  
  const originalPositions = useMemo(() => {
     const pos = geometry.attributes.position;
     const count = pos.count;
     const array = new Float32Array(count * 3);
     for(let i=0; i<count; i++) {
         array[i*3] = pos.getX(i);
         array[i*3+1] = pos.getY(i);
         array[i*3+2] = pos.getZ(i);
     }
     return array;
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);
    
    let bass = 0;
    let treble = 0;
    
    for(let i=0; i<20; i++) bass += dataArray[i];
    bass = (bass / 20) * settings.sensitivity;
    
    for(let i=80; i<150; i++) treble += dataArray[i];
    treble = (treble / 70) * settings.sensitivity;

    const time = clock.getElapsedTime() * settings.speed * 0.4;
    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i*3];
        const oy = originalPositions[i*3+1];
        const oz = originalPositions[i*3+2];
        
        // Simplified Noise Calculation
        // Removed one layer of trig functions for speed
        const noise1 = Math.sin(ox * 0.4 + time) * Math.cos(oy * 0.3 + time * 0.8) * Math.sin(oz * 0.4 + time * 1.2);
        
        let noise2 = 0;
        // Only calc detailed noise on Med/High
        if (settings.quality !== 'low') {
            noise2 = Math.sin(ox * 2.5 + time * 1.5) * Math.cos(oy * 2.5 + time * 1.7) * Math.sin(oz * 2.5 + time * 1.3);
        }
        
        const reactivity = (bass / 255);
        const vibration = (treble / 255);

        const d1 = noise1 * (0.3 + reactivity * 0.5);
        const d2 = noise2 * (0.05 + vibration * 0.15);

        const totalDisplacement = 1 + d1 + d2;
        
        positions.setXYZ(i, ox * totalDisplacement, oy * totalDisplacement, oz * totalDisplacement);
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.z = time * 0.05;
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      
      <Environment preset="city" />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[15, 15, 15]} intensity={2} color={colors[0]} />
      <pointLight position={[-15, -15, -5]} intensity={2} color={colors[1]} />
      <spotLight position={[0, 10, 0]} intensity={1} color={colors[2] || '#ffffff'} angle={0.5} penumbra={1} />
      
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            color={colors[0]}
            emissive={colors[1]}
            emissiveIntensity={0.2}
            metalness={0.95}    
            roughness={0.08}    
            clearcoat={1.0}     
            clearcoatRoughness={0.1}
            reflectivity={1.0}
            envMapIntensity={1.2}
            side={THREE.DoubleSide}
            flatShading={settings.quality === 'low'}
         />
      </mesh>
    </>
  );
};