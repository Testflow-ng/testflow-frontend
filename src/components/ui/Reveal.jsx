import { motion, useReducedMotion } from 'framer-motion';

/** Fade-and-rise entrance for a block. `delay` (seconds) staggers siblings. No motion when the user asks for less. */
function Reveal({ children, delay = 0, y = 14, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
