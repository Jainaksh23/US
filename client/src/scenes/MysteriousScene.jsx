import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GlowingOrb({ position, color, scale, speed }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.8;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.7 + offset) * 0.4;
    const pulse = 0.8 + Math.sin(t * 2 + offset) * 0.2;
    ref.current.material.emissiveIntensity = pulse * 0.6;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

function GlowingOrbs() {
  const orbs = useMemo(() => {
    const colors = ['#9B59B6', '#8E44AD', '#C0C0C0', '#6C3483', '#BB8FCE'];
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8 - 4,
      ],
      color: colors[i % colors.length],
      scale: 0.15 + Math.random() * 0.3,
      speed: 0.1 + Math.random() * 0.2,
    }));
  }, []);

  return orbs.map((orb, i) => (
    <GlowingOrb key={i} {...orb} />
  ));
}

export default function MysteriousScene() {
  const centralRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (centralRef.current) {
      centralRef.current.rotation.y = t * 0.03;
      centralRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    }
  });

  return (
    <>
      {/* Low ambient + rim lighting */}
      <ambientLight intensity={0.15} color="#1A1A2E" />
      <directionalLight position={[3, 2, 5]} intensity={0.4} color="#9B59B6" />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#C0C0C0" distance={15} />
      <pointLight position={[-4, -2, 3]} intensity={0.3} color="#9B59B6" distance={10} />
      {/* Rim lights */}
      <pointLight position={[5, 0, -3]} intensity={0.5} color="#6C3483" distance={12} />
      <pointLight position={[-5, 0, -3]} intensity={0.5} color="#BB8FCE" distance={12} />

      {/* Central mysterious sphere */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={centralRef} position={[0, 0, -6]} scale={2.5}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#1A1A2E"
            emissive="#9B59B6"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.9}
            distort={0.15}
            speed={0.8}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      </Float>

      {/* Glowing orbs */}
      <GlowingOrbs />

      {/* Slow star particles */}
      <Sparkles
        count={60}
        scale={18}
        size={2}
        speed={0.15}
        color="#C0C0C0"
        opacity={0.5}
      />
      <Sparkles
        count={30}
        scale={15}
        size={1.5}
        speed={0.1}
        color="#9B59B6"
        opacity={0.3}
      />

      {/* Dense fog */}
      <fog attach="fog" args={['#0F0F23', 5, 25]} />
    </>
  );
}
