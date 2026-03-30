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

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4 text-gray-900">
            Beat the{' '}
            <span className="gradient-text">ATS</span>
            <br />
            Land Your{' '}
            <span className="gradient-text-warm">Dream Job</span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 mb-8 max-w-[480px] mx-auto leading-relaxed">
            Upload your resume to <span className="font-semibold text-gray-700">Zentix</span> and get instant ATS compatibility scores, match against job descriptions, and receive AI-powered improvement suggestions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4 sm:px-0">
            <Link to="/upload" className="glow-btn w-full sm:w-auto">⬆ Upload Resume</Link>
            <Link to="/dashboard" className="glow-btn glow-btn-outline w-full sm:w-auto">◉ View Dashboard</Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[960px] px-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card p-6 text-left"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
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
