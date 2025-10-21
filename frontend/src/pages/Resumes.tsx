import React, { useCallback, useState } from 'react';
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

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith('text/')) {
        const content = await file.text();
        setText(content);
        toast.success('Resume text loaded from file');
      } else {
        // Fallback: attempt as text; prompt user to paste if unreadable
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = reader.result as string;
            // Simple heuristics: if lots of non-printable chars, ask for paste
            const nonPrintable = (result.match(/[\x00-\x08\x0E-\x1F]/g) || []).length;
            if (nonPrintable > 50) {
              toast.error('Could not extract text from this file. Please paste your resume text below.');
            } else {
              setText(result);
              toast.success('Resume text loaded');
            }
          } catch {
            toast.error('Failed to read file. Please paste your resume text below.');
          }
        };

  const aiParse = async () => {
    if (!text.trim()) {
      toast.error('Please provide resume text');
      return;
    }
    setAiLoading(true);
    try{
      const res = await fetch('/api/resumes/parse/', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer '+localStorage.getItem('access')
        },
        body: JSON.stringify({ text })
      })
      if(!res.ok){
        const errTxt = await res.text();
        throw new Error(errTxt || 'Failed to parse resume with AI')
      }
      const data = await res.json();
      setParsed(data);
      if (Array.isArray(data.skills)) setSkills(data.skills);
      toast.success('AI parsing complete');
    }catch(err:any){ toast.error(err.message || 'AI parse failed') }
    finally{ setAiLoading(false) }
  }
        reader.readAsText(file);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to read file');
    }
  }, []);

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
          Drop a .txt resume here, or paste your resume text below.
        </p>
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
            <button className="btn-primary" onClick={uploadText} disabled={loading}>Save Resume</button>
            <button className="btn-secondary" onClick={extractSkills} disabled={loading}>Extract Skills</button>
            <button className="btn-secondary" onClick={aiParse} disabled={aiLoading}>{aiLoading ? 'Parsing…' : 'AI Parse (skills + experience)'}</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Extracted Skills</h3>
        </div>
        <div className="card-body">
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
