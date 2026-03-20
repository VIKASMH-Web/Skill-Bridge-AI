const API_URL = 'http://localhost:8000/api';

export async function analyzeUpload(resumeFile: File | null, jdFile: File | null, resumeText: string | null, jdText: string | null) {
  const formData = new FormData();
  if (resumeFile) formData.append('resume', resumeFile);
  if (jdFile) formData.append('jd', jdFile);
  if (resumeText) formData.append('resume_text', resumeText);
  if (jdText) formData.append('jd_text', jdText);

  try {
    const res = await fetch(`${API_URL}/analyze/upload`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) {
      const detail = result.detail;
      const msg = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (typeof detail === 'object' ? JSON.stringify(detail) : detail);
      throw new Error(msg || `Server error: ${res.status}`);
    }
    return result;
  } catch (err: any) {
    throw err;
  }
}

export async function analyzeText(resumeText: string, jdText: string) {
  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
    });
    const result = await res.json();
    if (!res.ok) {
      const detail = result.detail;
      const msg = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (typeof detail === 'object' ? JSON.stringify(detail) : detail);
      throw new Error(msg || `Server error: ${res.status}`);
    }
    return result;
  } catch (err: any) {
    throw err;
  }
}
