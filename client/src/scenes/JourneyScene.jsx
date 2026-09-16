import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function JourneyScene() {
  const orbRef = useRef();
  
  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#FFD6E8" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4ECDC4" />
      
      <Sparkles count={150} scale={12} size={4} speed={0.4} opacity={0.3} color="#FFE66D" />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={orbRef}>
          <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial
              color="var(--accent)"
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              metalness={0.3}
              roughness={0.2}
              distort={0.4}
              speed={2}
            />
          </Sphere>
        </group>
      </Float>
    </>
  );
}
