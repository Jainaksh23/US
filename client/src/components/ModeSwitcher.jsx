import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const modes = [
  { key: 'sweet', label: 'Sweet', emoji: '🌸', desc: 'Tender & warm' },
  { key: 'playful', label: 'Playful', emoji: '🎮', desc: 'Fun & competitive' },
  { key: 'mysterious', label: 'Mysterious', emoji: '🔮', desc: 'Intriguing & witty' },
  { key: 'deeptalk', label: 'Deep Talk', emoji: '🕯️', desc: 'Honest & vulnerable' },
];

export default function ModeSwitcher({ isOpen, onClose }) {
  const { currentMode, setMode } = useStore();

  const handleSelect = (mode) => {
    setMode(mode);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mode-switcher-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <motion.div
            className="glass-card"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '32px',
              maxWidth: '480px',
              width: '90%',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              textAlign: 'center',
              marginBottom: '8px',
              color: 'var(--text)',
            }}>
              Choose Your Mood
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}>
              Set the vibe for your games
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              {modes.map((mode) => (
                <motion.button
                  key={mode.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(mode.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '18px 12px',
                    borderRadius: '16px',
                    border: currentMode === mode.key
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--card-border)',
                    background: currentMode === mode.key
                      ? 'var(--card-bg)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    boxShadow: currentMode === mode.key
                      ? '0 0 20px rgba(232, 180, 184, 0.2)'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{mode.emoji}</span>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}>{mode.label}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>{mode.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
