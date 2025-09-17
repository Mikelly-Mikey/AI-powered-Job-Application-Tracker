import { useEffect, useState } from 'react'
type Application = { id:number; job:number; status:string; notes:string }

export default function Tracker(){
  const [apps, setApps] = useState<Application[]>([])

  async function load(){
    const res = await fetch('/api/applications/', { headers:{'Authorization': 'Bearer '+localStorage.getItem('access')} })
    const data = await res.json()
    setApps(data)
  }
  useEffect(()=>{ load() }, [])

  return (
    <div>
      <h3>Application Tracker</h3>
      <ul>
        {apps.map(a=>(<li key={a.id}>{a.status} — job {a.job}</li>))}
      </ul>
      <p>(Kanban UI placeholder — you can enhance with drag-and-drop)</p>
    </div>
  )
}
