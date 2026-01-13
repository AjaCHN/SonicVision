
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../types';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const SilkWavesScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  
  // Optimized: Adjust segments based on quality setting
  // High: 50x50 (2500 vertices) -> Good for desktop
  // Med: 35x35 (1225 vertices)
  // Low: 24x24 (576 vertices) -> Crucial for mobile performance
  const geometry = useMemo(() => {
    let segs = 24;
    if (settings.quality === 'med') segs = 35;
    if (settings.quality === 'high') segs = 50;
    return new THREE.PlaneGeometry(60, 60, segs, segs);
  }, [settings.quality]);

  useFrame((state) => {
    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);

    let bass = 0;
    let treble = 0;

    // Use fewer bins for calculations
    for(let i=0; i<10; i++) bass += dataArray[i];
    bass = (bass / 10) * settings.sensitivity;

    for(let i=100; i<140; i++) treble += dataArray[i];
    treble = (treble / 40) * settings.sensitivity;

    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime() * settings.speed * 0.2;

    const bassNorm = bass / 255;
    const trebleNorm = treble / 255;

    // Vertex Loop: This runs on CPU every frame. 
    // Reducing vertex count (via geometry segments above) is the best optimization here.
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // Simplified math
        const z1 = Math.sin(x * 0.15 + time) * Math.cos(y * 0.12 + time * 0.7) * 4.0;
        const z2 = Math.sin(x * 0.4 - time * 1.2) * Math.sin(y * 0.35 + time * 0.9) * 2.0;
        
        const distSq = x*x + y*y; // Optimization: Avoid Sqrt inside loop if possible, but needed for ripple
        const dist = Math.sqrt(distSq); 
        const bassRipple = Math.sin(dist * 0.8 - time * 4.0) * bassNorm * 4.0;
        
        // Only apply treble detail if quality is not low
        let trebleDetail = 0;
        if (settings.quality !== 'low') {
            trebleDetail = Math.cos(x * 2.0 + time * 3.0) * Math.sin(y * 2.0 + time * 3.0) * trebleNorm * 1.2;
        }
        
        const combinedZ = z1 + z2 + bassRipple + trebleDetail;
        
        positions.setZ(i, combinedZ);
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.x = -Math.PI / 2.5;
    meshRef.current.rotation.z = time * 0.05;
  });

  return (
    <>
      <color attach="background" args={['#020205']} /> 
      <pointLight position={[25, 40, 25]} intensity={8.0} color={colors[0]} distance={150} />
      <pointLight position={[-25, 20, 25]} intensity={5.0} color={colors[1]} distance={150} />
      <spotLight position={[0, -40, 30]} angle={0.8} penumbra={0.6} intensity={15.0} color={colors[2] || '#ffffff'} distance={120} />
      <ambientLight intensity={0.8} />
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            color={colors[0]} 
            emissive={colors[1]} 
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
            clearcoat={1.0}
            clearcoatRoughness={0.2}
            sheen={1.5}
            sheenColor={new THREE.Color(colors[2] || '#ffffff')}
            sheenRoughness={0.4}
            side={THREE.DoubleSide}
            flatShading={settings.quality === 'low'} // Flat shading is faster on low
         />
      </mesh>
    </>
  );
};