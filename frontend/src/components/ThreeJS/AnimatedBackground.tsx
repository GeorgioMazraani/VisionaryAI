import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FogParticles() {
  const count = 100;
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;      // x
      positions[i * 3 + 1] = Math.random() * 15 - 5;      // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;  // z
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    
    // Rotate slowly
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    
    // Update particles
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(state.clock.getElapsedTime() * 0.2 + i) * 0.01;
      
      // Reset position if particle goes too high or too low
      if (positions[i3 + 1] > 10) positions[i3 + 1] = -5;
      if (positions[i3 + 1] < -5) positions[i3 + 1] = 10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref}>
      <PointMaterial
        transparent
        size={0.8}
        sizeAttenuation
        color="#4a90e2"
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}

function FloatingOrbs() {
  const count = 50;
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 10 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    ref.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.1;
  });

  return (
    <Points ref={ref}>
      <PointMaterial
        transparent
        size={1.2}
        sizeAttenuation
        color="#6495ed"
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}

function AnimatedFog() {
  const fogRef = useRef<THREE.Fog>(null);
  
  useFrame(({ clock }) => {
    if (!fogRef.current) return;
    // Animate fog density
    const time = clock.getElapsedTime();
    fogRef.current.near = 8 + Math.sin(time * 0.3) * 2;
    fogRef.current.far = 20 + Math.cos(time * 0.2) * 3;
  });

  return <fog ref={fogRef} attach="fog" args={['#0a192f', 8, 20]} />;
}

export const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 -z-10">
    <Canvas
      camera={{ position: [0, 0, 12], fov: 60 }}
      style={{ background: 'radial-gradient(circle at 50% 50%, #0a192f 0%, #020c1b 100%)' }}
    >
      <AnimatedFog />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4a90e2" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#6495ed" />
      <FogParticles />
      <FloatingOrbs />
    </Canvas>
  </div>
);