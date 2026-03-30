import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import FloatingCard from '../components/FloatingCard';
import { uploadResume, analyzeResume, matchResume } from '../api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { setError('Invalid file. Please upload a PDF or DOCX file.'); return; }
    if (accepted.length > 0) { setFile(accepted[0]); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async () => {
    if (!file) { setError('Please select a resume file first.'); return; }
    setUploading(true);
    setError('');
    try {
      setProgress('Uploading resume...');
      const uploadRes = await uploadResume(file);
      setProgress('Running AI ATS analysis...');
      const analysisRes = await analyzeResume(uploadRes.resume_id, jobDesc);
      
      let matchRes = null;
      // If we have a JD, we can also run the fast regex matcher to supplement results
      if (jobDesc.trim()) {
        setProgress('Finalizing match results...');
        try {
          matchRes = await matchResume(uploadRes.resume_id, jobDesc);
        } catch (mErr) {
          console.error("Match engine failed, using AI results only:", mErr);
        }
      }
      
      navigate('/dashboard', { state: { analysis: analysisRes, match: matchRes, filename: file.name } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong.');
    } finally {
      setUploading(false); setProgress('');
    }
  };

  return (
    <>
      <ParticleBackground />
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 className="section-title gradient-text" style={{ marginBottom: '0.4rem' }}>Upload Resume</h1>
          <p style={{ color: '#6B7280', fontSize: '1rem' }}>Drop your resume and an optional job description to get started.</p>
        </motion.div>

        <div className="resp-grid-2" style={{ marginBottom: '1.5rem' }}>
          <FloatingCard delay={0.1}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>📄 Resume File</h2>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} id="resume-dropzone">
              <input {...getInputProps()} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{file ? '✅' : isDragActive ? '📥' : '📁'}</span>
                {file ? (
                  <div>
                    <p style={{ color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</p>
                    <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#111827', fontWeight: 500, fontSize: '0.9rem' }}>{isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}</p>
                    <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>PDF or DOCX • Max 10 MB</p>
                  </div>
                )}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.2} className="flex flex-col h-full">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>
              🎯 Job Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
            </h2>
            <textarea
              id="job-description" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here to get a match score and missing keywords analysis..."
              rows={8}
              className="w-full rounded-xl p-4 text-sm resize-none outline-none bg-gray-50 border border-gray-200 text-gray-900 flex-grow"
              style={{ fontFamily: 'var(--font-main)', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
              {jobDesc.length > 0 ? `${jobDesc.split(/\s+/).filter(Boolean).length} words` : 'Adding a JD enables match scoring'}
            </p>
          </FloatingCard>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ display: 'flex', justifyContent: 'center' }}>
          <button id="analyze-btn" onClick={handleSubmit} disabled={uploading || !file} className="glow-btn" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
            {uploading ? (<><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙</span>{progress}</>) : (<>🚀 Analyze Resume</>)}
          </button>
        </motion.div>
      </div>
    </>
  );
}
