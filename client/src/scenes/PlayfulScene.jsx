import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BouncingShape({ position, geometry, color, speed, scale }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * speed + offset)) * 1.5;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.z = t * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {geometry === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {geometry === 'octahedron' && <octahedronGeometry args={[0.7]} />}
      {geometry === 'dodecahedron' && <dodecahedronGeometry args={[0.6]} />}
      {geometry === 'tetrahedron' && <tetrahedronGeometry args={[0.7]} />}
      {geometry === 'torus' && <torusGeometry args={[0.5, 0.2, 8, 16]} />}
      <MeshWobbleMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.2}
        factor={0.3}
        speed={2}
      />
    </mesh>
  );
}

function BouncingShapes() {
  const shapes = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8E72', '#95E1D3'];
    const geometries = ['box', 'octahedron', 'dodecahedron', 'tetrahedron', 'torus'];
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 10 - 3,
      ],
      geometry: geometries[i % geometries.length],
      color: colors[i % colors.length],
      speed: 0.5 + Math.random() * 1,
      scale: 0.2 + Math.random() * 0.35,
    }));
  }, []);

  return shapes.map((shape, i) => (
    <BouncingShape key={i} {...shape} />
  ));
}

export default function PlayfulScene() {
  const torusRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.15;
      torusRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <>
      {/* Bright, punchy lighting */}
      <ambientLight intensity={0.7} color="#FFFFFF" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFE66D" />
      <pointLight position={[-3, 2, 3]} intensity={1.5} color="#FF6B6B" distance={15} />
      <pointLight position={[3, -1, -2]} intensity={1.0} color="#4ECDC4" distance={12} />

      {/* Central decorative torus */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={torusRef} position={[0, 0, -6]} scale={2}>
          <torusKnotGeometry args={[1, 0.3, 128, 16]} />
          <meshStandardMaterial
            color="#4ECDC4"
            emissive="#FF6B6B"
            emissiveIntensity={0.15}
            roughness={0.2}
            metalness={0.4}
            transparent
            opacity={0.25}
            wireframe
          />
        </mesh>
      </Float>

      {/* Bouncing shapes */}
      <BouncingShapes />

      {/* Confetti-like sparkles */}
      <Sparkles
        count={120}
        scale={16}
        size={4}
        speed={0.8}
        color="#FFE66D"
        opacity={0.7}
      />
      <Sparkles
        count={60}
        scale={14}
        size={3}
        speed={1.2}
        color="#FF6B6B"
        opacity={0.5}
      />
      <Sparkles
        count={40}
        scale={12}
        size={2}
        speed={0.6}
        color="#4ECDC4"
        opacity={0.4}
      />

      <fog attach="fog" args={['#F7FFF7', 10, 35]} />
    </>
  );
}
