import { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import FloatingCard from '../components/FloatingCard';
import ScoreMeter from '../components/ScoreMeter';
import ResumeVisualization from '../components/ResumeVisualization';
import { downloadOptimizedResume } from '../api';

export default function DashboardPage() {
  const location = useLocation();
  const [fixing, setFixing] = useState(false);
  const { analysis, match, filename } = location.state || {};
  if (!analysis) return <Navigate to="/upload" replace />;

  const { 
    resume_id, 
    overall_score, 
    breakdown, 
    extracted_skills, 
    extracted_experience, 
    improved_experience,
    extracted_education, 
    detected_sections,
    validation,
    score_explanations
  } = analysis;

  const handleAutoFix = async () => {
    setFixing(true);
    try {
      await downloadOptimizedResume(resume_id, filename);
    } catch (err) {
      alert('Failed to generate optimized resume: ' + err.message);
    } finally {
      setFixing(false);
    }
  };

  const breakdownItems = [
    { key: 'keyword_match', label: 'Keywords', icon: '🔑', color: '#10B981' },
    { key: 'formatting', label: 'Formatting', icon: '📐', color: '#059669' },
    { key: 'section_presence', label: 'Sections', icon: '📋', color: '#84CC16' },
    { key: 'experience_relevance', label: 'Experience', icon: '💼', color: '#10B981' },
  ];

  return (
    <>
      <ParticleBackground />
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="resp-flex-between" style={{ alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 className="section-title gradient-text" style={{ marginBottom: '0.4rem' }}>Analysis Dashboard</h1>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>📄 {filename || 'Resume'} — Full ATS Report</p>
          </div>
          {validation && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: '30px', border: '1px solid #E5E7EB', backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>🤖 AI Confidence:</span>
                <span style={{ color: validation.confidence_score > 85 ? '#10B981' : '#F59E0B', fontWeight: 800 }}>{validation.confidence_score}%</span>
                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>|</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontStyle: 'italic', color: validation.hallucination_risk === 'LOW' ? '#10B981' : '#EF4444' }}>Risk: {validation.hallucination_risk}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Score + 3D */}
        <div className="resp-grid-2" style={{ marginBottom: '1.25rem' }}>
          <FloatingCard delay={0.1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <ScoreMeter score={overall_score} size={200} />
          </FloatingCard>
          <FloatingCard delay={0.2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResumeVisualization score={overall_score} height={280} />
          </FloatingCard>
        </div>

        {/* Breakdown */}
        <div className="resp-grid-4" style={{ marginBottom: '1.25rem' }}>
          {breakdownItems.map((item, i) => (
            <FloatingCard key={item.key} delay={0.3 + i * 0.08}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.icon}</div>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '0.2rem' }}>{item.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: item.color }}>{breakdown[item.key]}</span>
                <span style={{ fontSize: '0.7rem', color: '#D1D5DB' }}>/ 100</span>
              </div>
              <div style={{ marginTop: '0.6rem', width: '100%', height: '4px', borderRadius: '4px', background: '#F3F4F6' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown[item.key]}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                  style={{ height: '100%', borderRadius: '4px', background: item.color }}
                />
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Explanations (New for 2.0) */}
        {score_explanations && (
          <FloatingCard delay={0.4} style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem', borderLeft: '4px solid #8B5CF6' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8B5CF6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 AI SCORE INSIGHTS
            </h3>
            <div className="resp-grid-2" style={{ gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#4B5563' }}><span style={{ fontWeight: 600 }}>Keywords:</span> {score_explanations.keywords}</p>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '4px' }}><span style={{ fontWeight: 600 }}>Formatting:</span> {score_explanations.formatting}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#4B5563' }}><span style={{ fontWeight: 600 }}>Sections:</span> {score_explanations.sections}</p>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '4px' }}><span style={{ fontWeight: 600 }}>Relevance:</span> {score_explanations.relevance}</p>
              </div>
            </div>
          </FloatingCard>
        )}

        {/* Details */}
        <div className="resp-grid-3" style={{ marginBottom: '1.25rem' }}>
          <FloatingCard delay={0.5}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#059669' }}>🛠 Extracted Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {extracted_skills.length > 0
                ? extracted_skills.map((s, i) => <span key={i} className="tag-chip">{s}</span>)
                : <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>No skills detected</p>}
            </div>
          </FloatingCard>

          <FloatingCard delay={0.55}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#059669' }}>📋 Detected Sections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {detected_sections.length > 0
                ? detected_sections.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#10B981' }}>✓</span><span>{s}</span>
                  </div>
                ))
                : <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>No standard sections detected</p>}
            </div>
          </FloatingCard>

          <FloatingCard delay={0.6}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#059669' }}>🎓 Education & Experience</h3>
            {extracted_education.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>Education</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {extracted_education.map((ed, i) => <span key={i} className="tag-chip" style={{ background: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}>{ed}</span>)}
                </div>
              </div>
            )}
            {improved_experience && improved_experience.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#8B5CF6', marginBottom: '0.35rem' }}>🔑 Rewritten Highlights (Optimized)</p>
                {improved_experience.slice(0, 2).map((exp, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>{exp.role}</p>
                    {exp.improved_bullets?.slice(0, 1).map((b, j) => (
                      <p key={j} style={{ fontSize: '0.78rem', color: '#059669', fontStyle: 'italic', marginLeft: '4px' }}>✨ {b}</p>
                    ))}
                  </div>
                ))}
              </div>
            ) : extracted_experience && extracted_experience.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem' }}>Experience</p>
                {extracted_experience.map((exp, i) => <p key={i} style={{ fontSize: '0.82rem', marginBottom: '0.2rem' }}>• {exp}</p>)}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>No explicit education/experience detected</p>
            )}
          </FloatingCard>
        </div>

        {/* Job Match */}
        {match && (
          <FloatingCard delay={0.7} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#059669' }}>🎯 Job Description Match</h3>
            <div className="resp-grid-experience" style={{ alignItems: 'start' }}>
              <div style={{ textAlign: 'center' }}><ScoreMeter score={match.match_score} size={130} label="Match Score" /></div>
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.4rem' }}>Matched Keywords</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {match.matched_keywords.slice(0, 12).map((kw, i) => <span key={i} className="tag-chip">{kw}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.4rem' }}>Missing Keywords</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {match.missing_keywords.slice(0, 8).map((kw, i) => <span key={i} className="tag-chip" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>{kw}</span>)}
                </div>
              </div>
            </div>
          </FloatingCard>
        )}

        <div className="resp-flex-center" style={{ marginTop: '1rem' }}>
          <button 
            onClick={handleAutoFix} 
            disabled={fixing} 
            className="glow-btn" 
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', border: 'none' }}
          >
            {fixing ? '✨ Fixing...' : '✨ Auto-Fix & Download Optimized Resume'}
          </button>
          <Link to="/suggestions" state={location.state} className="glow-btn glow-btn-outline">💡 View Improvement Tips</Link>
          <Link to="/upload" className="glow-btn glow-btn-outline">⬆ Analyze Another</Link>
        </div>
      </div>
    </>
  );
}
