import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import FloatingCard from '../components/FloatingCard';

export default function SuggestionsPage() {
  const location = useLocation();
  const { analysis, match } = location.state || {};
  if (!analysis) return <Navigate to="/upload" replace />;

  const suggestions = analysis.suggestions || {};
  const matchSuggestions = match?.suggestions || [];

  const sections = [
    {
      title: '⚠️ Missing Keywords & Sections',
      items: suggestions.missing_keywords || [],
      color: '#D97706', bg: '#FFFBEB', borderColor: '#FDE68A', icon: '🔍',
    },
    {
      title: '💡 Improvement Tips',
      items: suggestions.improvement_tips || [],
      color: '#059669', bg: '#ECFDF5', borderColor: '#A7F3D0', icon: '📈',
    },
    {
      title: '✍️ Rewrite Suggestions',
      items: suggestions.rewrite_suggestions || [],
      color: '#7C3AED', bg: '#F5F3FF', borderColor: '#DDD6FE', icon: '📝',
    },
  ];

  if (matchSuggestions.length > 0) {
    sections.push({
      title: '🎯 Job Match Insights',
      items: matchSuggestions,
      color: '#0891B2', bg: '#ECFEFF', borderColor: '#A5F3FC', icon: '🎯',
    });
  }

  return (
    <>
      <ParticleBackground />
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 className="section-title gradient-text" style={{ marginBottom: '0.4rem' }}>Improvement Suggestions</h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Actionable tips to boost your ATS score and land more interviews.</p>
        </motion.div>

        {/* Score summary */}
        <FloatingCard delay={0.1} style={{ marginBottom: '1.5rem' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
            <div>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>Current ATS Score</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 900 }} className="gradient-text">{analysis.overall_score} / 100</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-0">
              {Object.entries(analysis.breakdown).map(([key, val]) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'capitalize', marginBottom: '0.15rem' }}>{key.replace(/_/g, ' ')}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </FloatingCard>

        {/* Suggestion Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sections.map((sec, si) => (
            <FloatingCard key={si} delay={0.2 + si * 0.1}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: sec.color }}>{sec.title}</h2>
              {sec.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sec.items.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + si * 0.1 + i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                        padding: '0.7rem 1rem', borderRadius: '10px',
                        background: sec.bg, border: `1px solid ${sec.borderColor}`,
                      }}>
                      <span style={{ marginTop: '1px', fontSize: '0.8rem', flexShrink: 0 }}>{sec.icon}</span>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#374151' }}>{item}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>No issues found in this category. Great job! ✅</p>
              )}
            </FloatingCard>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" state={location.state} className="glow-btn glow-btn-outline">◉ Back to Dashboard</Link>
          <Link to="/upload" className="glow-btn">⬆ Analyze Another Resume</Link>
        </div>
      </div>
    </>
  );
}
