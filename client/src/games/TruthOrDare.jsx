import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import useStore from '../store/useStore';
import { truthQuestions, dareQuestions } from '../data/questionData';

// 3D Spinning Wheel
function SpinWheel({ spinning, onSpinComplete, result }) {
  const wheelRef = useRef();
  const spinSpeed = useRef(0);
  const targetRotation = useRef(0);

  useFrame((state, delta) => {
    if (!wheelRef.current) return;

    if (spinning) {
      spinSpeed.current = Math.max(spinSpeed.current - delta * 1.5, 0);
      wheelRef.current.rotation.z += spinSpeed.current;

      if (spinSpeed.current <= 0.01 && spinning) {
        onSpinComplete?.();
      }
    } else {
      wheelRef.current.rotation.z += 0.003;
    }
  });

  const startSpin = useCallback(() => {
    spinSpeed.current = 15 + Math.random() * 10;
  }, []);

  // Expose startSpin
  if (wheelRef.current) {
    wheelRef.current.userData.startSpin = startSpin;
  }

  const segments = useMemo(() => {
    const colors = [
      ['#FF6B6B', '#FF8E8E'], // Truth
      ['#4ECDC4', '#6FE7DF'], // Dare
    ];
    const labels = ['Truth', 'Dare'];
    const segs = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const colorPair = colors[i % 2];
      segs.push({
        angle,
        color: colorPair[0],
        label: labels[i % 2],
      });
    }
    return segs;
  }, []);

  return (
    <group ref={wheelRef} position={[0, 0, 0]}>
      {segments.map((seg, i) => (
        <mesh key={i} rotation={[0, 0, seg.angle]}>
          <circleGeometry args={[2, 16, 0, Math.PI / 4]} />
          <meshStandardMaterial
            color={seg.color}
            emissive={seg.color}
            emissiveIntensity={0.15}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
      {/* Center cap */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Pointer arrow
function Pointer() {
  return (
    <mesh position={[0, 2.2, 0.1]}>
      <coneGeometry args={[0.15, 0.4, 3]} />
      <meshStandardMaterial color="#FFE66D" emissive="#FFE66D" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function TruthOrDare() {
  const { currentMode, socket, addToast } = useStore();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null); // 'truth' or 'dare'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const wheelGroupRef = useRef();

  const truths = useMemo(() => truthQuestions[currentMode] || truthQuestions.sweet, [currentMode]);
  const dares = useMemo(() => dareQuestions[currentMode] || dareQuestions.sweet, [currentMode]);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setShowQuestion(false);
    setResult(null);

    // Emit spin event
    socket?.emit('spin-wheel', { game: 'truthordare' });

    // Simulate spin time
    setTimeout(() => {
      const type = Math.random() > 0.5 ? 'truth' : 'dare';
      const questions = type === 'truth' ? truths : dares;
      const question = questions[Math.floor(Math.random() * questions.length)];

      setResult(type);
      setCurrentQuestion(question);
      setSpinning(false);
      setShowQuestion(true);

      // Emit result
      socket?.emit('spin-result', { type, question });
    }, 2500 + Math.random() * 1500);
  };

  // Listen for partner's spins
  useState(() => {
    if (!socket) return;
    socket.on('wheel-spinning', () => {
      addToast({ emoji: '🎯', title: 'Spinning!', message: 'Your partner is spinning the wheel...' });
    });
    socket.on('spin-result', (data) => {
      setResult(data.type);
      setCurrentQuestion(data.question);
      setShowQuestion(true);
      addToast({
        emoji: data.type === 'truth' ? '💬' : '🔥',
        title: `${data.spunBy} got: ${data.type.toUpperCase()}`,
        message: data.question,
      });
    });
    return () => {
      socket.off('wheel-spinning');
      socket.off('spin-result');
    };
  }, [socket]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 20px 40px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-display)',
          marginBottom: '8px',
          color: 'var(--text)',
        }}
      >
        🎯 Truth or Dare
      </motion.h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
        Spin the wheel and face your fate
      </p>

      {/* 3D Wheel */}
      <div style={{
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 3, 3]} intensity={1} color="var(--accent, #FFB6C1)" />
          <SpinWheel
            spinning={spinning}
            result={result}
            onSpinComplete={() => {}}
          />
          <Pointer />
        </Canvas>
      </div>

      {/* Spin button */}
      <motion.button
        className="btn-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={spinning}
        style={{
          fontSize: '1.1rem',
          padding: '14px 40px',
          marginBottom: '30px',
          opacity: spinning ? 0.6 : 1,
        }}
      >
        {spinning ? '✨ Spinning...' : '🎲 Spin!'}
      </motion.button>

      {/* Question display */}
      <AnimatePresence>
        {showQuestion && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="glass-card"
            style={{
              padding: '28px 32px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '6px 18px',
              borderRadius: '20px',
              background: result === 'truth'
                ? 'rgba(255, 107, 107, 0.15)'
                : 'rgba(78, 205, 196, 0.15)',
              color: result === 'truth' ? '#FF6B6B' : '#4ECDC4',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '16px',
              letterSpacing: '0.05em',
            }}>
              {result === 'truth' ? '💬 TRUTH' : '🔥 DARE'}
            </div>
            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'var(--text)',
              fontWeight: 500,
            }}>
              {currentQuestion}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
