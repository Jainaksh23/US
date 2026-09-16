import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

// Ember particle that slowly drifts upward
function Ember({ position, speed, scale }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + ((t * speed + offset) % 8) - 4;
    ref.current.position.x = position[0] + Math.sin(t * 0.3 + offset) * 0.3;
    const life = Math.sin(((t * speed + offset) % 8) / 8 * Math.PI);
    ref.current.material.opacity = life * 0.6;
    ref.current.scale.setScalar(scale * (0.5 + life * 0.5));
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial
        color="#FFB347"
        emissive="#FFB347"
        emissiveIntensity={1.5}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function Embers() {
  const embers = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 2,
      ],
      speed: 0.05 + Math.random() * 0.1,
      scale: 0.5 + Math.random() * 1,
    }));
  }, []);

  return embers.map((ember, i) => (
    <Ember key={i} {...ember} />
  ));
}

// Candle flame
function CandleFlame({ position }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.scale.y = 1 + Math.sin(t * 5) * 0.1 + Math.sin(t * 13) * 0.05;
    ref.current.scale.x = 1 + Math.sin(t * 7) * 0.05;
    ref.current.position.x = position[0] + Math.sin(t * 3) * 0.02;
  });

  return (
    <group ref={ref} position={position}>
      {/* Outer glow */}
      <mesh scale={[0.15, 0.25, 0.15]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#FFB347"
          emissive="#FFB347"
          emissiveIntensity={2}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Inner flame */}
      <mesh scale={[0.06, 0.15, 0.06]} position={[0, 0.05, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#FFF5E6"
          emissive="#FFFFFF"
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export default function DeepTalkScene() {
  const candleRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (candleRef.current) {
      candleRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }
  });

  return (
    <>
      {/* Very low ambient — candle-lit feel */}
      <ambientLight intensity={0.08} color="#1A1A1A" />
      <pointLight position={[0, 1, 2]} intensity={2.0} color="#FFB347" distance={12} decay={2} />
      <pointLight position={[0, 0.5, 2]} intensity={0.5} color="#FFF5E6" distance={6} decay={2} />

      {/* Central candle group */}
      <group ref={candleRef} position={[0, -1.5, 0]}>
        {/* Candle body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial color="#FFF5E6" roughness={0.8} />
        </mesh>
        {/* Flame */}
        <CandleFlame position={[0, 0.4, 0]} />
      </group>

      {/* Floating embers / dust motes */}
      <Embers />

      {/* Very subtle warm sparkles */}
      <Sparkles
        count={30}
        scale={15}
        size={1}
        speed={0.1}
        color="#FFB347"
        opacity={0.2}
      />

      {/* Minimal geometry — floating warm rings */}
      <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh position={[0, 0, -8]} scale={3} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[1, 0.02, 8, 64]} />
          <meshStandardMaterial
            color="#FFB347"
            emissive="#FFB347"
            emissiveIntensity={0.3}
            transparent
            opacity={0.15}
          />
        </mesh>
      </Float>
      <Float speed={0.2} rotationIntensity={0.03} floatIntensity={0.08}>
        <mesh position={[0, 1, -10]} scale={4} rotation={[0.5, 0.2, 0]}>
          <torusGeometry args={[1, 0.015, 8, 64]} />
          <meshStandardMaterial
            color="#FFB347"
            emissive="#FFB347"
            emissiveIntensity={0.2}
            transparent
            opacity={0.1}
          />
        </mesh>
      </Float>

      {/* Heavy fog for vignette effect */}
      <fog attach="fog" args={['#1A1A1A', 3, 20]} />
    </>
  );
}
