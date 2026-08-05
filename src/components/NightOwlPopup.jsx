import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const QUOTES = [
  'Shanoooo stop playing!',
  '5.0 is the goal joor',
  'No time to waste time',
  '5.0 or 5.0 BTC',
  'Your mates are reading oo',
  'This app no go read for you',
  'Oya stand up and read!',
  'Night owl mode activated',
  'Sleep is for the weak... but rest sha',
  'You wan carry last?',
  'E go be, but you gotta study',
  'Chai, you still dey scroll?',
];

const SESSION_KEY = 'tf_night_owl_count';
const MAX_PER_SESSION = 2;

function NightOwlPopup() {
  const [visible, setVisible] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 20 || hour >= 24) return;

    const shown = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
    if (shown >= MAX_PER_SESSION) return;

    const delay = 2000 + Math.random() * 5000;
    const timer = setTimeout(() => {
      const picked = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setQuote(picked);
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, String(shown + 1));

      setTimeout(() => setVisible(false), 5000);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={() => setVisible(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          style={{ pointerEvents: 'auto' }}
          className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-10 py-8 shadow-2xl"
        >
          <span className="text-6xl">😂</span>
          <p className="max-w-[260px] text-center text-lg font-bold leading-snug text-foreground-strong">
            {quote}
          </p>
          <p className="text-[10px] font-medium text-muted">tap to dismiss</p>
        </button>
      </motion.div>
    </div>,
    document.body,
  );
}

export default NightOwlPopup;
