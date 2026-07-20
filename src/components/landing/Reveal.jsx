import { motion } from 'framer-motion';

/**
 * Small on-scroll reveal. Fades and lifts its children into place once, when
 * they first enter the viewport. Kept subtle on purpose.
 */
function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
