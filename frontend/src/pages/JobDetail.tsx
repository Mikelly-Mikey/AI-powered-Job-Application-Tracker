import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

type Gap = { job_id:number; missing_keywords:string[]; coverage:number }

export default function JobDetail(){
  const { id } = useParams()
  const [gap, setGap] = useState<Gap | null>(null)

  useEffect(()=>{
    async function load(){
      const res = await fetch('/api/insights/gap/', {
        method:'POST',
        headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('access')},
        body: JSON.stringify({job_id: Number(id)})
      })
      const data = await res.json()
      setGap(data)
    }
    if(id) load()
  }, [id])

  return (
    <div>
      <h3>Gap Analysis</h3>
      {gap ? (
        <div>
          <div>Coverage: {Math.round(gap.coverage*100)}%</div>
          <ul>{gap.missing_keywords.map((k,i)=>(<li key={i}>{k}</li>))}</ul>
        </div>
      ) : <p>Loading…</p>}
    </div>
  )
}
