import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating heart shape geometry
function HeartShape() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.3);
    s.bezierCurveTo(0, 0.5, -0.1, 0.7, -0.3, 0.7);
    s.bezierCurveTo(-0.55, 0.7, -0.55, 0.35, -0.55, 0.35);
    s.bezierCurveTo(-0.55, 0.15, -0.35, -0.1, 0, -0.35);
    s.bezierCurveTo(0.35, -0.1, 0.55, 0.15, 0.55, 0.35);
    s.bezierCurveTo(0.55, 0.35, 0.55, 0.7, 0.3, 0.7);
    s.bezierCurveTo(0.1, 0.7, 0, 0.5, 0, 0.3);
    return s;
  }, []);

  return (
    <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }]} />
  );
}

function FloatingHearts({ count = 12 }) {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8 - 3,
      ],
      scale: 0.15 + Math.random() * 0.2,
      speed: 0.2 + Math.random() * 0.3,
      rotationSpeed: 0.1 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  return hearts.map((heart, i) => (
    <FloatingHeart key={i} {...heart} />
  ));
}

function FloatingHeart({ position, scale, speed, rotationSpeed, offset }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.5;
    ref.current.rotation.y = t * rotationSpeed;
    ref.current.rotation.z = Math.sin(t * 0.3 + offset) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <HeartShape />
      <meshStandardMaterial
        color="#FFB6C1"
        emissive="#FFD6E8"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function SweetScene() {
  const sphereRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.05;
      sphereRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#FFE4EC" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFD6E8" />
      <pointLight position={[0, 3, 0]} intensity={1.2} color="#FFB6C1" distance={15} />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#FFF7F2" distance={10} />

      {/* Floating background sphere with distortion */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={sphereRef} position={[0, 0, -5]} scale={3}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#FFD6E8"
            emissive="#FFB6C1"
            emissiveIntensity={0.15}
            roughness={0.4}
            metalness={0.1}
            distort={0.2}
            speed={1.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      {/* Floating hearts */}
      <FloatingHearts count={10} />

      {/* Sparkle particles — bokeh effect */}
      <Sparkles
        count={80}
        scale={15}
        size={3}
        speed={0.3}
        color="#FFB6C1"
        opacity={0.6}
      />
      <Sparkles
        count={40}
        scale={12}
        size={2}
        speed={0.2}
        color="#FFF7F2"
        opacity={0.4}
      />

      {/* Environment */}
      <fog attach="fog" args={['#FFE4EC', 8, 30]} />
    </>
  );
}
