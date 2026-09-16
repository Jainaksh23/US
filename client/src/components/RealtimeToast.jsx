import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function RealtimeToast() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '360px',
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            className="glass-card"
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '14px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{toast.emoji || '💕'}</span>
            <div>
              {toast.title && (
                <div style={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                  marginBottom: '2px',
                }}>
                  {toast.title}
                </div>
              )}
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}>
                {toast.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
