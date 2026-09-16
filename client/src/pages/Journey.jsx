import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function Journey() {
  const { token, partnerName } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/progress/combined/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>
        Loading our journey...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
        padding: '20px',
      }}
    >
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', pointerEvents: 'auto', padding: '40px' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2.5rem', 
          textAlign: 'center',
          marginBottom: '30px',
          background: 'var(--btn-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Our Journey ✨
        </h2>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <StatCard title="Games Played" value={stats.totalGamesPlayed} emoji="🎲" />
            <StatCard title="Current Streak" value={`${stats.currentStreak} days`} emoji="🔥" />
            <StatCard title="Longest Streak" value={`${stats.longestStreak} days`} emoji="👑" />
            <StatCard title="Coupons Redeemed" value={stats.combinedCoupons} emoji="🎟️" />
          </div>
        )}

        {stats && stats.partnerStats && (
          <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)' }}>Quiz Scores</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {stats.partnerStats.map((p, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>{p.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, emoji }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px 15px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
    </motion.div>
  );
}
