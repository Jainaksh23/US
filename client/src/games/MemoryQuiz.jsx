import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { quizQuestions } from '../data/questionData';

// Confetti hearts burst animation
function ConfettiHearts({ show }) {
  if (!show) return null;

  const hearts = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 200,
      y: -(80 + Math.random() * 120),
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
      size: 14 + Math.random() * 12,
    })), [show]);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      pointerEvents: 'none',
      zIndex: 20,
    }}>
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: h.x,
            y: h.y,
            opacity: 0,
            scale: 1,
            rotate: h.rotation,
          }}
          transition={{
            duration: 1.2,
            delay: h.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            fontSize: `${h.size}px`,
          }}
        >
          💖
        </motion.span>
      ))}
    </div>
  );
}

export default function MemoryQuiz() {
  const { currentMode, socket, addToast, currentPartner, scores, setScores } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);

  const questions = useMemo(
    () => quizQuestions[currentMode] || quizQuestions.sweet,
    [currentMode]
  );

  const current = questions[currentIndex % questions.length];

  useEffect(() => {
    if (!socket) return;
    const handleScore = (data) => {
      addToast({
        emoji: data.correct ? '🎉' : '😅',
        title: `${data.partner} ${data.correct ? 'got it right!' : 'missed it'}`,
        message: `Score: ${data.score}`,
      });
    };
    socket.on('quiz-score-update', handleScore);
    return () => socket.off('quiz-score-update', handleScore);
  }, [socket]);

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    // In this version, any answer is "correct" since answers are personalized
    // The couple discusses whether the answer matches — honor system
    const correct = answerIndex === current.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setShowConfetti(true);
      setStreak((s) => s + 1);
      setScores({
        ...scores,
        [currentPartner]: (scores[currentPartner] || 0) + 1,
      });
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setStreak(0);
    }

    socket?.emit('quiz-score', {
      questionIndex: currentIndex,
      answer: answerIndex,
      correct,
      score: (scores[currentPartner] || 0) + (correct ? 1 : 0),
    });
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setIsCorrect(null);
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
        🧠 Memory Quiz
      </motion.h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem' }}>
        How well do you know each other?
      </p>

      {/* Score & streak */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div className="glass-card" style={{ padding: '10px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
            {scores[currentPartner] || 0}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '10px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Streak</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
            {'🔥'.repeat(Math.min(streak, 5)) || '—'}
          </div>
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card"
        style={{
          padding: '28px 32px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          marginBottom: '24px',
          position: 'relative',
        }}
      >
        <ConfettiHearts show={showConfetti} />

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          opacity: 0.6,
        }}>
          Question {(currentIndex % questions.length) + 1} of {questions.length}
        </p>

        <motion.p
          animate={isCorrect === false ? {
            x: [0, -8, 8, -6, 6, -3, 3, 0],
          } : {}}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: '1.15rem',
            color: 'var(--text)',
            lineHeight: 1.6,
            fontWeight: 500,
            marginBottom: '24px',
          }}
        >
          {current.text}
        </motion.p>

        {/* Choices */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          {current.choices.map((choice, i) => (
            <motion.button
              key={i}
              whileHover={selectedAnswer === null ? { scale: 1.03 } : {}}
              whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
              onClick={() => handleAnswer(i)}
              disabled={selectedAnswer !== null}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: selectedAnswer === i
                  ? `2px solid ${isCorrect ? '#4ECDC4' : '#FF6B6B'}`
                  : '1.5px solid var(--card-border)',
                background: selectedAnswer === i
                  ? (isCorrect ? 'rgba(78, 205, 196, 0.15)' : 'rgba(255, 107, 107, 0.15)')
                  : 'var(--card-bg)',
                cursor: selectedAnswer !== null ? 'default' : 'pointer',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              {choice}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Result & Next */}
      <AnimatePresence>
        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <p style={{
              color: isCorrect ? '#4ECDC4' : '#FF6B6B',
              fontWeight: 600,
              fontSize: '1rem',
            }}>
              {isCorrect ? '🎉 You know them well!' : '😅 Not quite! Discuss the real answer together'}
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
