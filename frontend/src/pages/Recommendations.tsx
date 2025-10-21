import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
type Salary = { min?: number|null; max?: number|null; currency?: string|null; type?: string|null } | null
type Rec = { job_id:string; title:string; company:string; location?:string; remote_type?:string; salary?: Salary; required_skills?: string[]; missing_skills?: string[]; score:number }
type Gap = { job_id: string; missing_keywords: string[]; coverage: number }

export default function Recommendations(){
  const [recs, setRecs] = useState<Rec[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gaps, setGaps] = useState<Record<string, Gap | null>>({})
  const [gapLoading, setGapLoading] = useState<Record<string, boolean>>({})
  const [appByJob, setAppByJob] = useState<Record<string, { status: string }>>({})

  async function refresh(){
    setLoading(true); setError(null)
    try{
      const res = await fetch('/api/recommendations/refresh/', {
        method:'POST',
        headers:{'Authorization': 'Bearer '+localStorage.getItem('access')}
      })
      if(!res.ok) throw new Error('Failed to refresh')
      const data = await res.json()
      setRecs(data.results || [])
    }catch(err:any){
      setError(err.message)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ refresh(); loadApps(); }, [])

  async function loadApps(){
    try{
      const res = await fetch('/api/applications/', { headers:{ 'Authorization':'Bearer '+localStorage.getItem('access') } })
      if(!res.ok) return;
      const data = await res.json()
      const map: Record<string, {status:string}> = {}
      for (const a of data || []){
        const jid = (a.job_id || a.job || a.jobId || a.job_id)?.toString?.() || ''
        if (jid) map[jid] = { status: a.status || 'applied' }
      }
      setAppByJob(map)
    }catch{}
  }

  async function computeGap(jobId: string){
    setGapLoading(prev=>({...prev, [jobId]: true}))
    try{
      const res = await fetch('/api/insights/gap/', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': 'Bearer '+localStorage.getItem('access')
        },
        body: JSON.stringify({ job_id: jobId })
      })
      if(!res.ok) throw new Error('Failed to compute skills gap')
      const data = await res.json()
      setGaps(prev=>({...prev, [jobId]: data}))
    }catch(err:any){
      toast.error(err.message || 'Error computing gap')
    }finally{
      setGapLoading(prev=>({...prev, [jobId]: false}))
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recommended Jobs</h1>
        <button className="btn-secondary" onClick={refresh} disabled={loading}>{loading?'Refreshing...':'Refresh'}</button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="space-y-4">
        {recs.map(r => (
          <div key={r.job_id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{r.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{r.company}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-300">
                    {r.location && <span className="badge badge-secondary">{r.location}</span>}
                    {r.remote_type && <span className="badge badge-secondary">{r.remote_type}</span>}
                    {r.salary && (r.salary.min || r.salary.max) && (
                      <span className="badge badge-secondary">
                        {r.salary.currency || 'USD'} {r.salary.min ?? ''}{r.salary.min && r.salary.max ? ' - ' : ''}{r.salary.max ?? ''} {r.salary.type ? `(${r.salary.type})` : ''}
                      </span>
                    )}
                    <span className="badge badge-primary">Match {Math.round(r.score*100)}%</span>
                    {appByJob[r.job_id] && (
                      <span className="badge badge-success">{appByJob[r.job_id].status.replace('_',' ')}</span>
                    )}
                  </div>
                  {r.missing_skills && r.missing_skills.length>0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      Missing now: {r.missing_skills.slice(0,6).join(', ')}{r.missing_skills.length>6?'…':''}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => computeGap(r.job_id)} disabled={!!gapLoading[r.job_id]}>
                    {gapLoading[r.job_id] ? 'Analyzing...' : 'Skills gap'}
                  </button>
                </div>
              </div>
              {gaps[r.job_id] && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-200">Coverage</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.round((gaps[r.job_id]!.coverage || 0) * 100)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.round((gaps[r.job_id]!.coverage || 0) * 100)}%` }} />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Missing Skills</h4>
                  {gaps[r.job_id]!.missing_keywords?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {gaps[r.job_id]!.missing_keywords.map((k) => (
                        <span key={k} className="badge badge-secondary">{k}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">No missing skills detected.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {recs.length===0 && <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">No jobs yet. Seed jobs and upload your resume text.</p>}
    </div>
  )
}
