import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScoreMeter({ score = 0, size = 200, label = 'ATS Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1500;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const getColor = () => {
    if (animatedScore >= 80) return '#10B981';
    if (animatedScore >= 60) return '#059669';
    if (animatedScore >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getGrade = () => {
    if (animatedScore >= 90) return 'A+';
    if (animatedScore >= 80) return 'A';
    if (animatedScore >= 70) return 'B+';
    if (animatedScore >= 60) return 'B';
    if (animatedScore >= 50) return 'C';
    if (animatedScore >= 40) return 'D';
    return 'F';
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
    >
      <div className="relative score-ring" style={{ width: size, height: size, position: 'relative' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2.25rem', fontWeight: 900, color: getColor() }}>{animatedScore}</span>
          <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6B7280' }}>{label}</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: getColor(), marginTop: '2px' }}>Grade: {getGrade()}</p>
      </div>
    </motion.div>
  );
}
