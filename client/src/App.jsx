import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';

import useStore from './store/useStore';
import modeThemes from './theme/modeThemes';

// Pages
import Login from './pages/Login';

// Components
import Navbar from './components/Navbar';
import ModeSwitcher from './components/ModeSwitcher';
import RealtimeToast from './components/RealtimeToast';
import InstallPrompt from './components/InstallPrompt';

// 3D Scenes
import HubScene from './scenes/HubScene';
import SweetScene from './scenes/SweetScene';
import PlayfulScene from './scenes/PlayfulScene';
import MysteriousScene from './scenes/MysteriousScene';
import DeepTalkScene from './scenes/DeepTalkScene';
import JourneyScene from './scenes/JourneyScene';

// Games & Pages
import TruthOrDare from './games/TruthOrDare';
import WouldYouRather from './games/WouldYouRather';
import PersonalQA from './games/PersonalQA';
import MemoryQuiz from './games/MemoryQuiz';
import LoveCoupons from './games/LoveCoupons';
import Journey from './pages/Journey';

import './index.css';

const SCENE_MAP = {
  sweet: SweetScene,
  playful: PlayfulScene,
  mysterious: MysteriousScene,
  deeptalk: DeepTalkScene,
  journey: JourneyScene,
};

const GAME_MAP = {
  truthordare: TruthOrDare,
  wyr: WouldYouRather,
  personalqa: PersonalQA,
  quiz: MemoryQuiz,
  coupons: LoveCoupons,
  journey: Journey,
};

function LoadingFallback() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      zIndex: 1000,
    }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: '3rem' }}
      >
        💕
      </motion.div>
    </div>
  );
}

function App() {
  const {
    token,
    currentMode,
    currentGame,
    setCurrentGame,
    setSocket,
    setPartnerOnline,
    addToast,
    setMode,
  } = useStore();

  const [modeSwitcherOpen, setModeSwitcherOpen] = useState(false);

  // Apply initial theme CSS vars
  useEffect(() => {
    const theme = modeThemes[currentMode];
    if (theme?.cssVars) {
      Object.entries(theme.cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [currentMode]);

  // Set up Socket.io connection when authenticated
  useEffect(() => {
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('🔗 Connected to server');
      setSocket(socket);
    });

    socket.on('partner-connected', (data) => {
      setPartnerOnline(true);
      addToast({
        emoji: '💕',
        title: 'Partner Online!',
        message: `${data.partner} just joined`,
      });
    });

    socket.on('partner-disconnected', (data) => {
      setPartnerOnline(false);
      addToast({
        emoji: '💔',
        title: 'Partner Offline',
        message: `${data.partner} disconnected`,
      });
    });

    socket.on('mode-changed', (data) => {
      setMode(data.mode);
      addToast({
        emoji: modeThemes[data.mode]?.emoji || '✨',
        title: 'Mode Changed',
        message: `${data.changedBy} switched to ${modeThemes[data.mode]?.name}`,
      });
    });

    socket.on('game-opened', (data) => {
      addToast({
        emoji: '🎮',
        title: 'Game Started',
        message: `${data.openedBy} opened a game`,
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [token]);

  const handleSelectGame = (game) => {
    setCurrentGame(game);
    const { socket } = useStore.getState();
    socket?.emit('open-game', { game });
  };

  const handleBackToHub = () => {
    setCurrentGame(null);
  };

  // Not logged in → show login page
  if (!token) {
    return <Login />;
  }

  // Get the current scene component
  const SceneComponent = SCENE_MAP[currentMode] || SweetScene;
  const GameComponent = currentGame ? GAME_MAP[currentGame] : null;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 3D Background Scene */}
      {!prefersReducedMotion && (
        <div className={`canvas-container ${!currentGame ? 'interactive' : ''}`}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <AnimatePresence mode="wait">
                <SceneComponent key={currentMode} />
              </AnimatePresence>

              {/* Hub game objects — only shown when no game is active */}
              {!currentGame && (
                <HubScene onSelectGame={handleSelectGame} />
              )}
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Static background gradient for reduced-motion */}
      {prefersReducedMotion && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: modeThemes[currentMode]?.background?.gradient || 'var(--bg)',
          zIndex: 0,
        }} />
      )}

      {/* Navbar */}
      <Navbar
        onModeClick={() => setModeSwitcherOpen(true)}
        onBackToHub={handleBackToHub}
      />

      {/* Mode Switcher Modal */}
      <ModeSwitcher
        isOpen={modeSwitcherOpen}
        onClose={() => setModeSwitcherOpen(false)}
      />

      {/* Game Content or Hub prompt */}
      <AnimatePresence mode="wait">
        {GameComponent ? (
          <GameComponent key={currentGame} />
        ) : (
          <motion.div
            key="hub-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              className="glass-card"
              style={{
                padding: '32px 40px',
                textAlign: 'center',
                pointerEvents: 'auto',
                maxWidth: '460px',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.2rem',
                background: 'var(--btn-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
              }}>
                Us ✨
              </h1>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}>
                Click on any floating object to start a game, or switch moods to change the vibe.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                {Object.entries(GAME_MAP).map(([key, _]) => (
                  <motion.button
                    key={key}
                    className="btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectGame(key)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '8px 16px',
                      pointerEvents: 'auto',
                    }}
                  >
                    {key === 'truthordare' && '🎯 Truth or Dare'}
                    {key === 'wyr' && '⚖️ Would You Rather'}
                    {key === 'personalqa' && '💌 Personal Q&A'}
                    {key === 'quiz' && '🧠 Memory Quiz'}
                    {key === 'coupons' && '🎟️ Love Coupons'}
                    {key === 'journey' && '✨ Our Journey'}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <RealtimeToast />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
