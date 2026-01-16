
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

// 自定义星空组件
const DynamicStarfield = ({ treble, speed }: { treble: number; speed: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const count = 6000;
  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 100 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      s[i] = Math.random() * 1000;
    }
    return [pos, s];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTreble: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') }
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.02 * speed;
      pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTreble.value = treble;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-seed" count={count} array={seeds} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float seed;
          varying float vTwinkle;
          uniform float uTime;
          uniform float uTreble;
          void main() {
            float twinkle = sin(uTime * (1.5 + uTreble * 5.0) + seed) * 0.5 + 0.5;
            vTwinkle = twinkle;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (2.0 + vTwinkle * 2.0) * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vTwinkle;
          uniform vec3 uColor;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.2, dist) * (0.3 + vTwinkle * 0.7);
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  );
};

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
