
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for missing JSX types in R3F
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface DynamicStarfieldProps { 
  treble: number; 
  speed: number;
}

export const DynamicStarfield = ({ treble, speed }: DynamicStarfieldProps) => {
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
