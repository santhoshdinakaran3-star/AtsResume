import axios from 'axios';

// In production, use the Render backend URL. In dev, use the Vite proxy.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 180000,
});

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function analyzeResume(resumeId, jobDescription = "") {
  const { data } = await api.post('/analyze', { 
    resume_id: resumeId,
    job_description: jobDescription
  });
  return data;
}

export async function matchResume(resumeId, jobDescription) {
  const { data } = await api.post('/match', {
    resume_id: resumeId,
    job_description: jobDescription,
  });
  return data;
}

export async function downloadOptimizedResume(resumeId, originalFilename) {
  const response = await api.post(`/generate/${resumeId}`, {}, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Force .docx extension
  const baseName = originalFilename ? originalFilename.split('.').slice(0, -1).join('.') : 'Resume';
  const downloadName = `ATS_Optimized_${baseName}.docx`;
  
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default api;
