import { motion } from 'framer-motion';

export default function FloatingCard({
  children,
  className = '',
  delay = 0,
  glow = 'cyan',
  onClick,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </motion.div>
  );
}
