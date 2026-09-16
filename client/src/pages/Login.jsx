import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

// Simple 3D background for the login page
function LoginBackground() {
  return (
    <>
      <ambientLight intensity={0.4} color="#FFE4EC" />
      <pointLight position={[3, 3, 3]} intensity={1} color="#FFB6C1" />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="#E8B4B8" />

      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0, -3]} scale={2.5}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#FFD6E8"
            emissive="#FFB6C1"
            emissiveIntensity={0.15}
            roughness={0.4}
            distort={0.3}
            speed={2}
            transparent
            opacity={0.2}
          />
        </mesh>
      </Float>

      <Sparkles count={50} scale={12} size={3} speed={0.3} color="#FFB6C1" opacity={0.5} />
      <Sparkles count={30} scale={10} size={2} speed={0.2} color="#E8B4B8" opacity={0.3} />
      <fog attach="fog" args={['#FFF0F5', 5, 20]} />
    </>
  );
}

export default function Login() {
  const [view, setView] = useState('login'); // 'login' or 'register'
  const [coupleName, setCoupleName] = useState('');
  const [secret, setSecret] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useStore((s) => s.setAuth);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleName, secret, partnerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAuth(data.token, data.couple, data.currentPartner);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleName, secret, partner1, partner2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAuth(data.token, data.couple, data.currentPartner);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 3D Background */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
      }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <LoginBackground />
        </Canvas>
      </div>

      {/* Login Form Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', damping: 20 }}
          className="glass-card"
          style={{
            padding: '40px 36px',
            maxWidth: '420px',
            width: '100%',
          }}
        >
          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '28px' }}
          >
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.2rem',
              color: 'var(--text)',
              marginBottom: '6px',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              Us
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}>
              Your private space for love & play
            </p>
          </motion.div>

          {/* Toggle tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '24px',
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '4px',
          }}>
            {['login', 'register'].map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: view === v ? 'var(--btn-gradient)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              >
                {v === 'login' ? 'Sign In' : 'New Couple'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <input
                  className="input-field"
                  type="text"
                  placeholder="Couple name"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="text"
                  placeholder="Your name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="password"
                  placeholder="Your shared secret ✨"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ marginTop: '6px', width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Entering...' : 'Enter Our Space 💕'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <input
                  className="input-field"
                  type="text"
                  placeholder="Choose a couple name"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="text"
                  placeholder="Partner 1 name"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="text"
                  placeholder="Partner 2 name"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  type="password"
                  placeholder="Create your shared secret ✨"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ marginTop: '6px', width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Creating...' : 'Create Our Space 💖'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  color: '#FF6B6B',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginTop: '12px',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
