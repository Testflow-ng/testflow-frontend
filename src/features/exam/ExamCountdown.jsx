import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import Mascot from '../../components/brand/Mascot.jsx';

/**
 * The beat between "start" and the first question.
 *
 * The session already exists on the server by the time this shows, so the
 * countdown is not hiding a network wait — it is deliberate. Sitting a timed
 * paper is the one thing in this app with real stakes, and dropping straight
 * from a settings dialog into question one gives the student no moment to put
 * their pen down and focus. Three seconds of Flo getting ready does that job.
 *
 * Because it is time the user did not ask for, it is escapable three ways:
 * tap anywhere, press a key, or wait. Nobody is ever trapped watching a
 * mascot when they want to start.
 *
 * Under reduced motion the countdown is skipped entirely rather than shown
 * without animation — a static "3, 2, 1" is a delay with no purpose.
 */

const START_FROM = 3;

function ExamCountdown({ subjectCode, questionCount, durationMinutes, onDone }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(START_FROM);

  useEffect(() => {
    if (reduceMotion) {
      onDone();
      return undefined;
    }

    const tick = setInterval(() => {
      setCount((c) => c - 1);
    }, 800);
    return () => clearInterval(tick);
  }, [reduceMotion, onDone]);

  // Fires when the counter runs past zero. Kept in its own effect so the
  // interval above is never responsible for navigation.
  useEffect(() => {
    if (count > 0) return undefined;
    const done = setTimeout(onDone, 450);
    return () => clearTimeout(done);
  }, [count, onDone]);

  // Any key, any tap: go now.
  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [onDone]);

  if (reduceMotion) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDone}
      className="fixed inset-0 z-[700] flex cursor-pointer flex-col items-center justify-center gap-6 bg-background"
    >
      <Mascot
        mood="confident"
        animation={count > 0 ? 'bounce' : 'jump'}
        size={128}
        className="text-primary"
      />

      <div className="text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          {subjectCode}
        </p>
        {/*
          `key` on the number forces a remount each tick, so the entrance
          animation replays. Without it React reuses the node and the digit
          would simply swap with no motion.
        */}
        <p
          key={count}
          className="tf-rise-in font-heading text-[5rem] font-extrabold leading-none tabular-nums text-foreground-strong"
        >
          {count > 0 ? count : 'Go'}
        </p>
        <p className="mt-3 font-mono text-[13px] tabular-nums text-muted">
          {questionCount} questions &middot; {durationMinutes} minutes
        </p>
      </div>

      <p className="absolute bottom-10 text-[13px] font-medium text-muted">Tap to skip</p>
    </div>
  );
}

export default ExamCountdown;
