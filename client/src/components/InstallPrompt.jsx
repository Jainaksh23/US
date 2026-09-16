import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // For iOS, just show our custom prompt after a small delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // For Android/Chrome, listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="glass-card"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            margin: '0 auto',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Install App</h3>
            <button 
              onClick={() => setShowPrompt(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
            >
              ✕
            </button>
          </div>
          
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isIOS 
              ? 'To install this app on your iPhone: tap the Share button (square with arrow) at the bottom, then scroll down and tap "Add to Home Screen".'
              : 'Install this app on your home screen for the best full-screen experience and quick access.'}
          </p>

          {!isIOS && deferredPrompt && (
            <button className="btn-primary" onClick={handleInstallClick} style={{ marginTop: '8px' }}>
              Add to Home Screen
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
