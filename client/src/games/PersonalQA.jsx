import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

// Envelope animation states: sealed → opening → open
function Envelope({ question, isOwn, onOpen }) {
  const [state, setState] = useState('sealed'); // sealed, opening, open

  const handleOpen = () => {
    if (state !== 'sealed') return;
    setState('opening');
    setTimeout(() => setState('open'), 600);
    onOpen?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      style={{
        perspective: '1000px',
        marginBottom: '16px',
      }}
    >
      <motion.div
        className="glass-card"
        whileHover={state === 'sealed' ? { scale: 1.02 } : {}}
        onClick={handleOpen}
        style={{
          padding: '24px',
          cursor: state === 'sealed' ? 'pointer' : 'default',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Envelope flap animation */}
        <AnimatePresence>
          {state === 'sealed' && (
            <motion.div
              exit={{ rotateX: -180, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'var(--btn-gradient)',
                opacity: 0.2,
                transformOrigin: 'top center',
                borderRadius: '20px 20px 0 0',
              }}
            />
          )}
        </AnimatePresence>

        {state === 'sealed' && (
          <div>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>💌</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isOwn ? 'Your question was sent!' : 'You have a question! Tap to open'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px', opacity: 0.6 }}>
              From: {question.sentBy || 'Your partner'}
            </p>
          </div>
        )}

        {state === 'opening' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ fontSize: '2rem' }}>✨</span>
            <p style={{ color: 'var(--text-secondary)' }}>Opening...</p>
          </motion.div>
        )}

        {state === 'open' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text)',
              lineHeight: 1.6,
              fontWeight: 500,
              marginBottom: '8px',
            }}>
              {question.text}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              — {question.sentBy || 'Your partner'} 💕
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PersonalQA() {
  const { socket, addToast, currentPartner } = useStore();
  const [questionText, setQuestionText] = useState('');
  const [sentQuestions, setSentQuestions] = useState([]);
  const [receivedQuestions, setReceivedQuestions] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [answeringIndex, setAnsweringIndex] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (data) => {
      setReceivedQuestions((prev) => [...prev, data]);
      addToast({
        emoji: '💌',
        title: 'New Question!',
        message: `${data.sentBy} sent you a question`,
      });
    };
    const handleAnswer = (data) => {
      setAnswers((prev) => [...prev, data]);
      addToast({
        emoji: '💬',
        title: 'Answer Received!',
        message: `${data.answeredBy} answered your question`,
      });
    };
    socket.on('receive-question', handleReceive);
    socket.on('receive-answer', handleAnswer);
    return () => {
      socket.off('receive-question', handleReceive);
      socket.off('receive-answer', handleAnswer);
    };
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const q = {
      text: questionText.trim(),
      sentBy: currentPartner,
      timestamp: Date.now(),
    };

    socket?.emit('send-question', q);
    setSentQuestions((prev) => [...prev, q]);
    setQuestionText('');
    addToast({ emoji: '📤', message: 'Question sent to your partner!' });
  };

  const handleAnswer = (index) => {
    if (!answerText.trim()) return;

    const answer = {
      questionIndex: index,
      text: answerText.trim(),
      answeredBy: currentPartner,
    };

    socket?.emit('send-answer', answer);
    setAnsweringIndex(null);
    setAnswerText('');
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
        💌 Personal Q&A
      </motion.h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>
        Send secret questions to each other
      </p>

      {/* Compose question */}
      <motion.form
        onSubmit={handleSend}
        className="glass-card"
        style={{
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          marginBottom: '32px',
          display: 'flex',
          gap: '12px',
        }}
      >
        <input
          className="input-field"
          type="text"
          placeholder="Type a question for your partner..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ flex: 1 }}
        />
        <motion.button
          className="btn-primary"
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!questionText.trim()}
          style={{ opacity: questionText.trim() ? 1 : 0.5, whiteSpace: 'nowrap' }}
        >
          Send 💌
        </motion.button>
      </motion.form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '800px',
        width: '100%',
      }}>
        {/* Received Questions */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            color: 'var(--text)',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            📩 Received
          </h3>
          {receivedQuestions.length === 0 ? (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textAlign: 'center',
              opacity: 0.6,
            }}>
              No questions yet — ask your partner to send one!
            </p>
          ) : (
            receivedQuestions.map((q, i) => (
              <div key={i}>
                <Envelope question={q} isOwn={false} onOpen={() => setAnsweringIndex(i)} />
                {answeringIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '12px',
                      marginTop: '-8px',
                    }}
                  >
                    <input
                      className="input-field"
                      placeholder="Your answer..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem', padding: '10px 14px' }}
                      autoFocus
                    />
                    <button
                      className="btn-primary"
                      onClick={() => handleAnswer(i)}
                      style={{ padding: '10px 16px', fontSize: '0.8rem' }}
                    >
                      Reply
                    </button>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sent Questions */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            color: 'var(--text)',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            📤 Sent
          </h3>
          {sentQuestions.length === 0 ? (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textAlign: 'center',
              opacity: 0.6,
            }}>
              Send your first question above!
            </p>
          ) : (
            sentQuestions.map((q, i) => (
              <Envelope key={i} question={q} isOwn={true} />
            ))
          )}
          {/* Show received answers */}
          {answers.map((a, i) => (
            <motion.div
              key={`answer-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{
                padding: '16px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {a.answeredBy} replied:
              </p>
              <p style={{ color: 'var(--text)', fontWeight: 500 }}>{a.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
