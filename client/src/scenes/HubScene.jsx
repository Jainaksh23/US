import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

// Individual game object in the hub
function GameObject({ position, game, geometry, color, emissive, label, emoji, featured, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.3 + offset;
    ref.current.rotation.x = Math.sin(t * 0.5 + offset) * 0.15;
    const s = hovered ? 1.2 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={position}>
        <mesh
          ref={ref}
          onClick={onClick}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
          {geometry === 'icosahedron' && <icosahedronGeometry args={[0.5, 0]} />}
          {geometry === 'octahedron' && <octahedronGeometry args={[0.5]} />}
          {geometry === 'dodecahedron' && <dodecahedronGeometry args={[0.5]} />}
          {geometry === 'box' && <boxGeometry args={[0.7, 0.5, 0.05]} />}
          {geometry === 'torus' && <torusGeometry args={[0.35, 0.15, 8, 16]} />}
          <meshStandardMaterial
            color={hovered ? emissive : color}
            emissive={emissive}
            emissiveIntensity={hovered ? 0.6 : 0.2}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        
        {/* Featured Highlight */}
        {featured && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.85, 32]} />
            <meshBasicMaterial color="#FFE66D" transparent opacity={0.5} />
          </mesh>
        )}
        
        {/* Label */}
        <Html
          position={[0, -0.85, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            color: 'var(--text)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 0.3s',
          }}>
            <span style={{ fontSize: '18px', display: 'block', marginBottom: '2px' }}>{emoji}</span>
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}

export default function HubScene({ onSelectGame }) {
  const theme = useStore((s) => s.theme);

  const games = [
    {
      game: 'truthordare',
      geometry: 'icosahedron',
      color: theme.palette.accent,
      emissive: theme.palette.glow,
      label: 'Truth or Dare',
      emoji: '🎯',
      position: [-3, 0.5, 0],
      featured: true,
    },
    {
      game: 'wyr',
      geometry: 'octahedron',
      color: theme.palette.primary,
      emissive: theme.palette.glow,
      label: 'Would You Rather',
      emoji: '⚖️',
      position: [-1.5, -0.5, -1],
    },
    {
      game: 'personalqa',
      geometry: 'box',
      color: theme.palette.secondary === '#FFF7F2' ? theme.palette.accent : theme.palette.secondary,
      emissive: theme.palette.glow,
      label: 'Personal Q&A',
      emoji: '💌',
      position: [0, 1, -0.5],
    },
    {
      game: 'quiz',
      geometry: 'dodecahedron',
      color: theme.palette.accent,
      emissive: theme.palette.glow,
      label: 'Memory Quiz',
      emoji: '🧠',
      position: [1.5, -0.5, -1],
    },
    {
      game: 'coupons',
      geometry: 'torus',
      color: theme.palette.primary,
      emissive: theme.palette.glow,
      label: 'Love Coupons',
      emoji: '🎟️',
      position: [3, 0.5, 0],
    },
  ];

  return (
    <>
      {games.map((g) => (
        <GameObject
          key={g.game}
          {...g}
          onClick={() => onSelectGame(g.game)}
        />
      ))}
    </>
  );
}
