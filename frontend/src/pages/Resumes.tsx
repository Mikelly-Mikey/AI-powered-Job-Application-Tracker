import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Resumes() {
  const [dragOver, setDragOver] = useState(false);
  const [text, setText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [parsed, setParsed] = useState<{
    summary?: string;
    skills?: string[];
    experience?: Array<{company?: string; title?: string; location?: string; start_date?: string; end_date?: string; bullets?: string[]}>;
    education?: Array<{institution?: string; degree?: string; field?: string; start_date?: string; end_date?: string}>;
  } | null>(null);
  const [analysisPct, setAnalysisPct] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function computeAnalysisPct(skillsList: string[]): number {
    const pct = Math.min(100, Math.round((skillsList.length / 40) * 100));
    return pct;
  }

  async function refreshRecommendations(){
    try{
      await fetch('/api/recommendations/refresh/', {
        method:'POST',
        headers:{ 'Authorization':'Bearer '+localStorage.getItem('access') }
      })
    }catch{}
  }

  async function saveResumeText(resumeText: string){
    if (!resumeText.trim()) {
      toast.error('Please provide resume text');
      return false;
    }
    setLoading(true);
    try{
      const res = await fetch('/api/resumes/text/', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('access') },
        body: JSON.stringify({ text: resumeText })
      });
      if(!res.ok) throw new Error('Failed to save resume');
      toast.success('Resume saved');
      return true;
    }catch(err:any){ toast.error(err.message || 'Failed to save resume'); return false }
    finally{ setLoading(false) }
  }

  async function tryAiParse(resumeText: string){
    if (!resumeText.trim()) { toast.error('Please provide resume text'); return }
    setAiLoading(true);
    try{
      const res = await fetch('/api/resumes/parse/', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('access') },
        body: JSON.stringify({ text: resumeText })
      });
      if(!res.ok){
        const errTxt = await res.text();
        throw new Error(errTxt || 'Failed to parse resume with AI');
      }
      const data = await res.json();
      setParsed(data);
      if (Array.isArray(data.skills)) setSkills(data.skills);
      toast.success('AI parsing complete');
    }catch(err:any){ toast.error(err.message || 'AI parse failed') }
    finally{ setAiLoading(false) }
  }

  async function doExtractSkills(resumeText: string){
    if (!resumeText.trim()) { toast.error('Please provide resume text'); return }
    setLoading(true);
    try{
      const res = await fetch('/api/resumes/extract-skills/', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('access') },
        body: JSON.stringify({ text: resumeText })
      });
      if(!res.ok) throw new Error('Failed to extract skills');
      const data = await res.json();
      const list = data.skills || [];
      setSkills(list);
      setAnalysisPct(computeAnalysisPct(list));
      toast.success('Skills extracted');
    }catch(err:any){ toast.error(err.message || 'Failed to extract skills') }
    finally{ setLoading(false) }
  }

  async function processResumeText(resumeText: string){
    setText(resumeText);
    const saved = await saveResumeText(resumeText);
    await tryAiParse(resumeText);
    await doExtractSkills(resumeText);
    if (saved) await refreshRecommendations();
  }

  async function uploadFile(file: File){
    const name = file.name || ''
    const ext = name.split('.').pop()?.toLowerCase()
    if (!ext || !['pdf','docx'].includes(ext)){
      toast.error('Only PDF or DOCX files are supported for upload');
      return;
    }
    try{
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/resumes/upload/', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access') },
        body: fd,
      });
      if (!res.ok){
        const t = await res.text();
        throw new Error(t || 'Upload failed');
      }
      const data = await res.json();
      const txt = data.text || '';
      setText(txt);
      toast.success('Resume uploaded and text extracted');
      await tryAiParse(txt);
      await doExtractSkills(txt);
      await refreshRecommendations();
    }catch(err:any){ toast.error(err.message || 'Upload failed') }
  }

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file);
    } catch (err: any) {
      toast.error(err.message || 'Failed to read file');
    }
  }, []);

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try{ await uploadFile(file) }catch(err:any){ toast.error(err.message || 'Failed to read file') }
  };

  const uploadText = async () => {
    if (!text.trim()) {
      toast.error('Please provide resume text');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/resumes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access')
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Failed to save resume');
      toast.success('Resume saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const extractSkills = async () => {
    if (!text.trim()) {
      toast.error('Please provide resume text');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/resumes/extract-skills/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access')
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Failed to extract skills');
      const data = await res.json();
      setSkills(data.skills || []);
      toast.success('Skills extracted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resumes</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop your resume or paste the text to extract skills.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 mb-6 transition-colors ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600'}`}
      >
        <p className="text-center text-gray-600 dark:text-gray-300">
          Drop a .pdf or .docx resume here, or
          <button type="button" className="ml-1 text-primary-600 hover:text-primary-500 underline" onClick={() => fileInputRef.current?.click()}>click to upload</button>.
        </p>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={onFileInputChange} />
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resume Text</h3>
        </div>
        <div className="card-body">
          <textarea
            className="input h-64 resize-y font-mono"
            placeholder="Paste your resume text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="btn-primary" onClick={async()=>{ if(await saveResumeText(text)) await refreshRecommendations() }} disabled={loading}>Save Resume</button>
            <button className="btn-secondary" onClick={async()=>{ await doExtractSkills(text); await refreshRecommendations(); }} disabled={loading}>Extract Skills</button>
            <button className="btn-secondary" onClick={async()=>{ await tryAiParse(text); setAnalysisPct(computeAnalysisPct(skills)); await refreshRecommendations(); }} disabled={aiLoading}>{aiLoading ? 'Parsing…' : 'AI Parse (skills + experience)'}</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Extracted Skills</h3>
        </div>
        <div className="card-body">
          {analysisPct !== null && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-200">Analysis</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{analysisPct}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${analysisPct}%` }} />
              </div>
            </div>
          )}
          {skills.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No skills extracted yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="badge badge-secondary">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {parsed && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Parsed Experience & Education</h3>
          </div>
          <div className="card-body">
            {parsed.summary && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Summary</h4>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{parsed.summary}</p>
              </div>
            )}
            {parsed.experience && parsed.experience.length>0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Experience</h4>
                <div className="mt-2 space-y-3">
                  {parsed.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{exp.title} {exp.company ? `@ ${exp.company}` : ''}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{exp.location || ''}</div>
                      <div className="text-xs text-gray-500">{[exp.start_date, exp.end_date].filter(Boolean).join(' — ')}</div>
                      {exp.bullets && exp.bullets.length>0 && (
                        <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 dark:text-gray-200">
                          {exp.bullets.map((b, i)=>(<li key={i}>{b}</li>))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {parsed.education && parsed.education.length>0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Education</h4>
                <div className="mt-2 space-y-3">
                  {parsed.education.map((ed, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{ed.institution}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{[ed.degree, ed.field].filter(Boolean).join(' — ')}</div>
                      <div className="text-xs text-gray-500">{[ed.start_date, ed.end_date].filter(Boolean).join(' — ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
