import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerMode, VisualizerSettings } from '../types';

// Augment JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      fog: any;
      mesh: any;
      circleGeometry: any;
      meshBasicMaterial: any;
      pointLight: any;
      primitive: any;
      meshStandardMaterial: any;
      ambientLight: any;
      sphereGeometry: any;
      icosahedronGeometry: any;
      points: any;
      pointsMaterial: any;
      lineSegments: any;
      lineBasicMaterial: any;
      bufferGeometry: any;
      bufferAttribute: any;
      group: any;
      planeGeometry: any;
      meshPhysicalMaterial: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      fog: any;
      mesh: any;
      circleGeometry: any;
      meshBasicMaterial: any;
      pointLight: any;
      primitive: any;
      meshStandardMaterial: any;
      ambientLight: any;
      sphereGeometry: any;
      icosahedronGeometry: any;
      points: any;
      pointsMaterial: any;
      lineSegments: any;
      lineBasicMaterial: any;
      bufferGeometry: any;
      bufferAttribute: any;
      group: any;
      planeGeometry: any;
      meshPhysicalMaterial: any;
    }
  }
}

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; // Added mode prop
}

// ================= SCENE: THE SINGULARITY =================
const SingularityScene: React.FC<{ analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings }> = ({ analyser, colors, settings }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const particleCount = 2000;
  
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 9; 
        temp[i * 3] = Math.cos(angle) * r;
        temp[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Flattened y
        temp[i * 3 + 2] = Math.sin(angle) * r;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    analyser.getByteFrequencyData(dataArray);

    let lowEnd = 0;
    for (let i = 0; i < 20; i++) lowEnd += dataArray[i];
    lowEnd = (lowEnd / 20) * settings.sensitivity;

    const positions = pointsRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();
    const speed = settings.speed * (0.2 + (lowEnd / 255));

    pointsRef.current.rotation.y += 0.005 * settings.speed;

    for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const x = particles[ix];
        const z = particles[iz];
        
        const angle = Math.atan2(z, x) + speed * (10 / Math.sqrt(x*x + z*z));
        const radiusBase = Math.sqrt(x*x + z*z);
        
        const expansion = (lowEnd / 255) * 2;
        const radius = radiusBase + (Math.sin(time * 5 + i) * expansion);

        positions.setXYZ(i, Math.cos(angle) * radius, particles[iy] + Math.sin(time + i) * (lowEnd/500), Math.sin(angle) * radius);
    }
    positions.needsUpdate = true;
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={1.5} color={colors[0]} distance={20} />
      <pointLight position={[0, -2, 0]} intensity={1.5} color={colors[1]} distance={20} />
      
      <points ref={pointsRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={colors[0]} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
      <ambientLight intensity={0.2} />
    </>
  );
};

// ================= SCENE: SILK WAVES =================
const SilkWavesScene: React.FC<{ analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings }> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(30, 30, 128, 128), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);

    let vol = 0;
    for(let i=0; i<30; i++) vol += dataArray[i];
    vol = (vol / 30) * settings.sensitivity;

    const positions = meshRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime() * settings.speed * 0.5;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = Math.sin(x * 0.5 + time) * Math.cos(y * 0.3 + time * 1.5) * 2;
        const ripple = Math.sin(Math.sqrt(x*x + y*y) * 2 - time * 3) * (vol / 255) * 1.5;
        positions.setZ(i, z + ripple);
    }
    positions.needsUpdate = true;
    
    meshRef.current.rotation.x = -Math.PI / 3;
    meshRef.current.rotation.z = time * 0.1;
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <pointLight position={[10, 10, 10]} intensity={2} color={colors[0]} />
      <pointLight position={[-10, -10, 10]} intensity={2} color={colors[1]} />
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshStandardMaterial 
            color="#222" 
            emissive={colors[0]} 
            emissiveIntensity={0.2}
            metalness={0.9} 
            roughness={0.2} 
            side={THREE.DoubleSide}
         />
      </mesh>
      <ambientLight intensity={0.2} />
    </>
  );
};

// ================= SCENE: LIQUID SPHERE =================
const LiquidSphereScene: React.FC<{ analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings }> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  // Use higher detail icosahedron for smoother displacement
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(4, 10), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    analyser.getByteFrequencyData(dataArray);

    let lowEnd = 0;
    for(let i=0; i<30; i++) lowEnd += dataArray[i];
    lowEnd = (lowEnd / 30) * settings.sensitivity;

    const time = clock.getElapsedTime() * settings.speed;
    const positions = meshRef.current.geometry.attributes.position;
    const originalPositions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions.getX(i);
        const oy = originalPositions.getY(i);
        const oz = originalPositions.getZ(i);

        // Simple noise simulation using sin/cos
        const noise = Math.sin(ox * 0.5 + time) * Math.cos(oy * 0.5 + time) * Math.sin(oz * 0.5 + time);
        const displacement = 1 + (noise * 0.3) + ((lowEnd/255) * noise * 0.5);

        positions.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
    }
    positions.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.2;
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color={colors[0]} />
      <pointLight position={[-10, -10, 10]} intensity={2} color={colors[1]} />
      
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            color={colors[0]}
            emissive={colors[1]}
            emissiveIntensity={0.2}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
         />
      </mesh>
    </>
  );
};

// ================= SCENE: LOW POLY TERRAIN =================
const LowPolyTerrainScene: React.FC<{ analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings }> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(60, 60, 40, 40), []);

  useFrame(({ clock }) => {
     if (!meshRef.current) return;
     analyser.getByteFrequencyData(dataArray);

     let bass = 0;
     for(let i=0; i<20; i++) bass += dataArray[i];
     bass = (bass/20) * settings.sensitivity;

     const positions = meshRef.current.geometry.attributes.position;
     const time = clock.getElapsedTime() * settings.speed;

     for(let i=0; i<positions.count; i++) {
         const x = positions.getX(i);
         const y = positions.getY(i);
         
         // Terrain generation
         // Move 'y' input by time to simulate flying forward
         const noiseY = y + time * 5;
         
         const h = Math.sin(x * 0.2) * Math.cos(noiseY * 0.2) * 2 
                 + Math.sin(x * 0.5 + noiseY * 0.5) * 1;
         
         // Audio reactivity: scale height
         const audioH = h * (1 + bass/100);
         
         positions.setZ(i, audioH);
     }
     positions.needsUpdate = true;
  });

  return (
      <>
        <color attach="background" args={[colors[2] || '#1a1a2e']} />
        <fog attach="fog" args={[colors[2] || '#1a1a2e', 10, 40]} />
        
        {/* Sun */}
        <mesh position={[0, 10, -30]}>
            <circleGeometry args={[8, 32]} />
            <meshBasicMaterial color={colors[0]} />
        </mesh>

        <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -5, 0]}>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial 
                color={colors[1]} 
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


// ================= MAIN COMPONENT =================

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  if (!analyser) return null;

  const renderScene = () => {
    switch (mode) {
        case VisualizerMode.SINGULARITY:
            return <SingularityScene analyser={analyser} colors={colors} settings={settings} />;
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

  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 2, 15], fov: 60 }} 
        dpr={[1, 2]} 
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping }}
      >
        {renderScene()}
        
        {/* Global Post Processing */}
        {settings.glow && (
            <EffectComposer>
                <Bloom 
                    luminanceThreshold={0.2} 
                    luminanceSmoothing={0.9} 
                    height={300} 
                    intensity={1.5} 
                />
                <ChromaticAberration 
                    offset={new THREE.Vector2(0.002 * settings.sensitivity, 0.002)}
                />
            </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;