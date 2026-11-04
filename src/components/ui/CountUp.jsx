import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/** Counts up to `value` on mount. Pass `suffix` ("%"). Shows the final number at once when motion is reduced. */
function CountUp({ value, suffix = '', duration = 0.9 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduce) return undefined;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [value, suffix, duration, reduce]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

export default CountUp;
