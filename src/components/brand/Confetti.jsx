import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

/**
 * Confetti burst.
 *
 * Hand-rolled rather than pulled from a library: the canvas-based packages are
 * 10-25KB gzipped and run a rAF loop, which competes with React for the main
 * thread at exactly the moment a result screen is mounting. This is ~30 absolutely
 * positioned divs animating transform and opacity, so it composites on the GPU
 * and costs nothing after it finishes.
 *
 * It unmounts itself when the burst ends. A celebration that keeps a timer alive
 * behind a screen the user has moved on from is a battery leak, not delight.
 *
 * Colours come from the brand's status palette, not a rainbow: green, amber and
 * blue are the colours this app already uses to mean something.
 */

const PIECE_COUNT = 30;
const DURATION_MS = 2600;

const COLORS = [
  'bg-success',
  'bg-warning',
  'bg-primary',
  'bg-info',
  'bg-success',
  'bg-primary',
];

/**
 * Deterministic pseudo-random from an index, so a re-render never reshuffles
 * pieces mid-flight (which would look like a glitch rather than confetti).
 */
const rand = (i, salt) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Confetti({ active = true, className }) {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || reduceMotion) return undefined;
    const timer = setTimeout(() => setDone(true), DURATION_MS + 400);
    return () => clearTimeout(timer);
  }, [active, reduceMotion]);

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        // Spread across the width, biased slightly toward the centre.
        left: 8 + rand(i, 1) * 84,
        // Fan outward: pieces near the edges travel further sideways.
        drift: (rand(i, 2) - 0.5) * 160,
        delay: rand(i, 3) * 420,
        duration: DURATION_MS - rand(i, 4) * 700,
        rotate: (rand(i, 5) - 0.5) * 900,
        size: 6 + Math.round(rand(i, 6) * 5),
        color: COLORS[i % COLORS.length],
        round: rand(i, 7) > 0.6,
      })),
    [],
  );

  // Celebration is decoration by definition, so it is the first thing to drop
  // when a user has asked for less motion.
  if (!active || done || reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className={cn('tf-confetti absolute top-0 block', p.color, p.round ? 'rounded-full' : 'rounded-[1px]')}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            '--tf-drift': `${p.drift}px`,
            '--tf-rotate': `${p.rotate}deg`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
