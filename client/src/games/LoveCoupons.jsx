import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const defaultCoupons = [
  { id: 1, title: "Breakfast in Bed", description: "One morning of your choice, breakfast served to you with love", emoji: "🥞" },
  { id: 2, title: "Movie Night Pick", description: "You choose the movie — no complaints, no falling asleep", emoji: "🎬" },
  { id: 3, title: "Massage Session", description: "20 minutes of a dedicated shoulder & back massage", emoji: "💆" },
  { id: 4, title: "No Chores Day", description: "One full day where you do absolutely nothing — I handle it all", emoji: "🧹" },
  { id: 5, title: "Date Night Planner", description: "I plan the entire date — outfit suggestion included", emoji: "🌹" },
  { id: 6, title: "Love Letter", description: "A handwritten love letter delivered within 24 hours", emoji: "💌" },
  { id: 7, title: "Dessert of Choice", description: "I'll make or buy your absolute favorite dessert", emoji: "🍰" },
  { id: 8, title: "Uninterrupted Cuddle", description: "30 minutes of pure cuddling — phones away, world paused", emoji: "🤗" },
  { id: 9, title: "Adventure Wildcard", description: "I'll plan a spontaneous mini-adventure — just say when", emoji: "🗺️" },
  { id: 10, title: "Wish Granted", description: "One reasonable wish, no questions asked", emoji: "⭐" },
];

function CouponCard({ coupon, onRedeem }) {
  const [flipped, setFlipped] = useState(coupon.redeemed);

  const handleRedeem = () => {
    if (flipped) return;
    setFlipped(true);
    onRedeem(coupon);
  };

  return (
    <motion.div
      whileHover={!flipped ? { scale: 1.04, y: -5 } : {}}
      style={{
        perspective: '1000px',
        minWidth: '260px',
        maxWidth: '280px',
        height: '180px',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front */}
        <div
          className="glass-card"
          onClick={handleRedeem}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: flipped ? 'default' : 'pointer',
            textAlign: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '2.2rem' }}>{coupon.emoji}</span>
          <h4 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            color: 'var(--text)',
            fontWeight: 600,
          }}>
            {coupon.title}
          </h4>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}>
            {coupon.description}
          </p>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--accent)',
            fontWeight: 600,
            marginTop: '4px',
          }}>
            Tap to redeem ✨
          </span>
        </div>

        {/* Back — Redeemed */}
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--btn-gradient)',
            border: 'none',
          }}
        >
          <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</span>
          <h4 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            color: 'white',
            fontWeight: 600,
          }}>
            Redeemed!
          </h4>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '4px',
          }}>
            {coupon.title}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoveCoupons() {
  const { socket, addToast, currentPartner } = useStore();
  const [coupons, setCoupons] = useState(
    defaultCoupons.map((c) => ({ ...c, redeemed: false }))
  );

  useEffect(() => {
    if (!socket) return;
    const handleRedeemed = (data) => {
      addToast({
        emoji: '🎟️',
        title: 'Coupon Redeemed!',
        message: `${data.redeemedBy} redeemed "${data.title}"`,
      });
    };
    socket.on('coupon-redeemed', handleRedeemed);
    return () => socket.off('coupon-redeemed', handleRedeemed);
  }, [socket]);

  const handleRedeem = (coupon) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, redeemed: true } : c))
    );
    socket?.emit('redeem-coupon', {
      couponId: coupon.id,
      title: coupon.title,
    });
    addToast({
      emoji: '✨',
      title: 'Coupon Redeemed!',
      message: `You redeemed "${coupon.title}"`,
    });
  };

  const active = coupons.filter((c) => !c.redeemed);
  const redeemed = coupons.filter((c) => c.redeemed);

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
        🎟️ Love Coupons
      </motion.h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
        Redeem a coupon and your partner gets notified
      </p>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '28px',
        fontSize: '0.8rem',
        opacity: 0.6,
      }}>
        {active.length} available • {redeemed.length} redeemed
      </p>

      {/* Horizontal coupon carousel */}
      <div style={{
        width: '100%',
        overflowX: 'auto',
        paddingBottom: '16px',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '8px 20px',
          minWidth: 'min-content',
          justifyContent: active.length <= 3 ? 'center' : 'flex-start',
        }}>
          {active.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      </div>

      {/* Redeemed section */}
      {redeemed.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '32px',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <h3 style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}>
            ✅ Redeemed Coupons
          </h3>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {redeemed.map((coupon) => (
              <div
                key={coupon.id}
                className="glass-card"
                style={{
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 0.6,
                }}
              >
                <span>{coupon.emoji}</span>
                <span style={{ textDecoration: 'line-through' }}>{coupon.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
