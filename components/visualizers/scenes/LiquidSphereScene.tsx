
import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LiquidSphereScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const light3Ref = useRef<THREE.SpotLight>(null);

  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  
  const c0 = useRef(new THREE.Color(colors[0]));
  const c1 = useRef(new THREE.Color(colors[1] || colors[0]));
  const c2 = useRef(new THREE.Color(colors[2] || colors[0]));
  const targetColor = useRef(new THREE.Color());

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
    const lerpSpeed = 0.05;
    c0.current.lerp(targetColor.current.set(colors[0] || '#ffffff'), lerpSpeed);
    c1.current.lerp(targetColor.current.set(colors[1] || colors[0] || '#ffffff'), lerpSpeed);
    c2.current.lerp(targetColor.current.set(colors[2] || colors[0] || '#ffffff'), lerpSpeed);

    if (materialRef.current) {
        materialRef.current.color = c0.current;
        materialRef.current.emissive = c1.current;
        materialRef.current.emissiveIntensity = settings.quality === 'low' ? 0.1 : 0.2;
    }
    
    if (light1Ref.current) light1Ref.current.color = c0.current;
    if (light2Ref.current) light2Ref.current.color = c1.current;

    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);
    
    let bass = 0;
    let treble = 0;
    for(let i=0; i<15; i++) bass += dataArray[i];
    bass = (bass / 15) * settings.sensitivity;
    for(let i=100; i<160; i++) treble += dataArray[i];
    treble = (treble / 60) * settings.sensitivity;

    const time = clock.getElapsedTime() * settings.speed * 0.4;
    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    const reactivity = (bass / 255);
    const vibration = (treble / 255);

    for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i*3];
        const oy = originalPositions[i*3+1];
        const oz = originalPositions[i*3+2];
        
        const noise1 = Math.sin(ox * 0.4 + time) * Math.cos(oy * 0.3 + time * 0.8) * Math.sin(oz * 0.4 + time * 1.2);
        let noise2 = 0;
        if (settings.quality !== 'low') {
            noise2 = Math.sin(ox * 3.0 + time * 2.0) * Math.cos(oy * 3.0 + time * 2.0) * Math.sin(oz * 3.0 + time * 2.0);
        }
        
        const d1 = noise1 * (0.4 + reactivity * 0.8);
        const d2 = noise2 * (0.05 + vibration * 0.25);
        const totalDisplacement = Math.max(0.3, 1.0 + d1 + d2);
        
        positions.setXYZ(i, ox * totalDisplacement, oy * totalDisplacement, oz * totalDisplacement);
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <>
      <color attach="background" args={['#030303']} />
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>
      <ambientLight intensity={0.4} />
      <pointLight ref={light1Ref} position={[20, 20, 20]} intensity={15} distance={100} />
      <pointLight ref={light2Ref} position={[-20, -20, 10]} intensity={10} distance={100} />
      <spotLight ref={light3Ref} position={[0, 40, 0]} intensity={5} angle={0.6} penumbra={1} />
      
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            ref={materialRef}
            metalness={settings.quality === 'low' ? 0.5 : 0.8}
            roughness={settings.quality === 'low' ? 0.4 : 0.15}
            clearcoat={settings.quality === 'high' ? 1.0 : 0.0}
            clearcoatRoughness={0.1}
            reflectivity={0.8}
            envMapIntensity={0.6}
            side={THREE.DoubleSide}
            flatShading={settings.quality === 'low'}
         />
      </mesh>
    </>
  );
};
