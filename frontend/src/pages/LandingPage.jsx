import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const features = [
  { icon: '🔍', title: 'ATS Analysis', desc: 'Deep scan for keyword matching, formatting, and section structure.' },
  { icon: '📊', title: 'Smart Scoring', desc: 'AI-powered 0–100 score with detailed breakdown across 4 factors.' },
  { icon: '🎯', title: 'Job Matching', desc: 'Cosine similarity matching between your resume and job descriptions.' },
  { icon: '💡', title: 'Rewrite Tips', desc: 'Actionable suggestions to boost your ATS score and land interviews.' },
];

export default function LandingPage() {
  return (
    <>
      <ParticleBackground />
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ maxWidth: '620px', marginBottom: '3rem' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.375rem 0.875rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
              background: '#ECFDF5',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#059669',
            }}
          >
            ⚡ AI-Powered Resume Analysis
          </motion.div>

          <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1rem', color: '#111827' }}>
            Beat the{' '}
            <span className="gradient-text">ATS</span>
            <br />
            Land Your{' '}
            <span className="gradient-text-warm">Dream Job</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            Upload your resume, get instant ATS compatibility scores, match against job descriptions, and receive AI-powered improvement suggestions.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/upload" className="glow-btn">⬆ Upload Resume</Link>
            <Link to="/dashboard" className="glow-btn glow-btn-outline">◉ View Dashboard</Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', maxWidth: '960px' }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card"
              style={{ padding: '1.5rem', textAlign: 'left' }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#6B7280' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px', borderRadius: '50%', opacity: 0.06, pointerEvents: 'none',
          background: 'radial-gradient(circle, #10B981, transparent 70%)', filter: 'blur(100px)',
        }} />
      </div>
    </>
  );
}
