import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { wyrQuestions } from '../data/questionData';

function OptionCard({ text, side, selected, partnerPicked, onClick, disabled }) {
  const isLeft = side === 'A';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04, rotateY: isLeft ? 3 : -3 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      animate={{
        opacity: selected === null ? 1 : (selected === side ? 1 : 0.35),
        scale: selected === side ? 1.05 : (selected !== null ? 0.95 : 1),
        rotateY: selected === side ? (isLeft ? -5 : 5) : 0,
      }}
      onClick={onClick}
      disabled={disabled}
      className="glass-card"
      style={{
        flex: 1,
        padding: '32px 24px',
        cursor: disabled ? 'default' : 'pointer',
        border: selected === side
          ? '2px solid var(--accent)'
          : '1.5px solid var(--card-border)',
        textAlign: 'center',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: 'var(--font-body)',
        color: 'var(--text)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {partnerPicked === side && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '1.2rem',
          }}
        >
          💕
        </motion.div>
      )}
      <span style={{ fontSize: '2rem' }}>{isLeft ? '🅰️' : '🅱️'}</span>
      <p style={{
        fontSize: '1.05rem',
        lineHeight: 1.5,
        fontWeight: 500,
      }}>
        {text}
      </p>
    </motion.button>
  );
}

export default function WouldYouRather() {
  const { currentMode, socket, addToast, currentPartner } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [partnerPicked, setPartnerPicked] = useState(null);

  const questions = useMemo(
    () => wyrQuestions[currentMode] || wyrQuestions.sweet,
    [currentMode]
  );

  const current = questions[currentIndex % questions.length];

  useEffect(() => {
    if (!socket) return;
    const handleCardPicked = (data) => {
      setPartnerPicked(data.choice);
      addToast({
        emoji: '⚖️',
        title: `${data.pickedBy} chose!`,
        message: `They picked Option ${data.choice}`,
      });
    };
    socket.on('card-picked', handleCardPicked);
    return () => socket.off('card-picked', handleCardPicked);
  }, [socket]);

  const handlePick = (choice) => {
    if (selected) return;
    setSelected(choice);
    socket?.emit('card-pick', {
      game: 'wyr',
      questionIndex: currentIndex,
      choice,
    });
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setPartnerPicked(null);
  };

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
        ⚖️ Would You Rather
      </motion.h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
        Choose wisely — your partner can see your pick
      </p>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '32px',
        fontSize: '0.8rem',
        opacity: 0.6,
      }}>
        Question {(currentIndex % questions.length) + 1} of {questions.length}
      </p>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: '16px',
        maxWidth: '700px',
        width: '100%',
        marginBottom: '28px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <OptionCard
          text={current.optionA}
          side="A"
          selected={selected}
          partnerPicked={partnerPicked}
          onClick={() => handlePick('A')}
          disabled={!!selected}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 700,
          color: 'var(--accent)',
          fontSize: '1.2rem',
        }}>
          OR
        </div>
        <OptionCard
          text={current.optionB}
          side="B"
          selected={selected}
          partnerPicked={partnerPicked}
          onClick={() => handlePick('B')}
          disabled={!!selected}
        />
      </div>

      {/* Result & Next */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You chose: <strong style={{ color: 'var(--accent)' }}>Option {selected}</strong>
              {partnerPicked && (
                <span>
                  {' '}• Partner chose: <strong style={{ color: 'var(--accent)' }}>Option {partnerPicked}</strong>
                  {partnerPicked === selected ? ' 💕 Match!' : ' 🤔 Different vibes!'}
                </span>
              )}
            </p>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
            >
              Next Question →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
