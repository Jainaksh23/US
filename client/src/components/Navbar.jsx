import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function Navbar({ onModeClick, onBackToHub }) {
  const { currentPartner, currentMode, theme, partnerOnline, currentGame, logout } = useStore();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        borderRadius: '20px',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        maxWidth: '95vw',
      }}
    >
      {/* Back button when in a game */}
      {currentGame && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToHub}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '4px 8px',
            borderRadius: '8px',
          }}
          title="Back to Hub"
        >
          ← Hub
        </motion.button>
      )}

      {/* Partner name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '1.1rem' }}>💕</span>
        <span style={{
          fontWeight: 600,
          fontSize: '0.9rem',
          color: 'var(--text)',
        }}>
          {currentPartner}
        </span>
        {/* Online indicator */}
        <div
          title={partnerOnline ? 'Partner is online' : 'Partner is offline'}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: partnerOnline ? '#4ECDC4' : '#999',
            boxShadow: partnerOnline ? '0 0 8px #4ECDC4' : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      </div>

      {/* Divider */}
      <div style={{
        width: '1px',
        height: '20px',
        background: 'var(--card-border)',
      }} />

      {/* Mode indicator button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onModeClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '12px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          cursor: 'pointer',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: 500,
        }}
      >
        <span>{theme.emoji || '🌸'}</span>
        <span>{theme.name}</span>
      </motion.button>

      {/* Divider */}
      <div style={{
        width: '1px',
        height: '20px',
        background: 'var(--card-border)',
      }} />

      {/* Logout */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-body)',
          padding: '4px 8px',
        }}
        title="Logout"
      >
        ✕
      </motion.button>
    </motion.nav>
  );
}
