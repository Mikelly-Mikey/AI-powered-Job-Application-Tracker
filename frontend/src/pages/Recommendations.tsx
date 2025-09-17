import { useEffect, useState } from 'react'
type Rec = { job_id:number; title:string; company:string; score:number }

export default function Recommendations(){
  const [recs, setRecs] = useState<Rec[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(()=>{ refresh() }, [])

  return (
    <div>
      <h3>Recommended Jobs</h3>
      <button onClick={refresh} disabled={loading}>{loading?'Refreshing...':'Refresh'}</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {recs.map(r => (
          <li key={r.job_id} style={{margin:'8px 0'}}>
            <strong>{r.title}</strong> — {r.company} <em>(score {r.score.toFixed(3)})</em>
          </li>
        ))}
      </ul>
      {recs.length===0 && <p>No jobs yet. Seed jobs and upload your resume text.</p>}
    </div>
  )
}
