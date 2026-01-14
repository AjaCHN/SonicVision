import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LowPolyTerrainScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const fogRef = useRef<THREE.Fog>(null);

  const { bass, mids, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const geometry = useMemo(() => {
    const segments = settings.quality === 'high' ? 50 : settings.quality === 'med' ? 35 : 25;
    return new THREE.PlaneGeometry(80, 80, segments, segments);
  }, [settings.quality]);

  useFrame(({ clock }) => {
     const time = clock.getElapsedTime() * settings.speed * 0.2;

     if (materialRef.current) materialRef.current.color = c1;
     if (sunRef.current) {
        (sunRef.current.material as THREE.MeshBasicMaterial).color = c0;
        const sunScale = 1.0 + bass * 0.5;
        sunRef.current.scale.set(sunScale, sunScale, sunScale);
        sunRef.current.position.y = 10 + Math.cos(time * 0.2) * 5;
     }
     if (fogRef.current) {
        fogRef.current.color = c2;
        fogRef.current.near = 10 - bass * 5;
        fogRef.current.far = 40 + mids * 15;
     }

     if (!meshRef.current) return;
     const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;

     for(let i=0; i<positions.count; i++) {
         const x = positions.getX(i);
         const y = positions.getY(i);

         const y_moved = y + time * 10;
         const noise1 = Math.sin(x * 0.1 + y_moved * 0.05) * 2.0;
         const noise2 = Math.sin(x * 0.3 + y_moved * 0.2) * 0.8;
         const noise3 = settings.quality === 'high' ? Math.sin(x * 0.8 + y_moved * 0.6) * 0.3 : 0;
         
         const height = noise1 + noise2 + noise3;
         const audioH = height * (1 + bass * 1.5);
         positions.setZ(i, audioH);
     }
     positions.needsUpdate = true;
     meshRef.current.geometry.computeVertexNormals();
  });

  return (
      <>
        <color attach="background" args={[c2.getStyle()]} /> 
        <fog ref={fogRef} attach="fog" args={[c2.getStyle(), 10, 40]} />
        <Stars radius={150} depth={100} count={6000} factor={5} saturation={0} fade speed={1.5} />
        
        <mesh ref={sunRef} position={[0, 10, -30]}>
            <circleGeometry args={[8, 32]} />
            <meshBasicMaterial color={c0} toneMapped={false} />
        </mesh>
        
        <mesh ref={meshRef} rotation={[-Math.PI/2.2, 0, 0]} position={[0, -5, 0]}>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial 
                ref={materialRef}
                flatShading={true} 
                roughness={0.9}
                metalness={0.1}
            />
        </mesh>
        
        <ambientLight intensity={0.6} color={c1} />
        <directionalLight 
            color={c0} 
            intensity={2.5} 
            position={[10, 20, -20]}
        />
      </>
  );
};
