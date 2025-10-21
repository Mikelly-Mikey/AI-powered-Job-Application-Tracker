import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type Application = { id: number|string; job?: number|string; job_id?: string; title?: string; company?: string; status: string; notes?: string }

const STATUSES = [
  'saved',
  'applied',
  'phone_screen',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
]

export default function Tracker(){
  const [apps, setApps] = useState<Application[]>([])
  const [draggingId, setDraggingId] = useState<string|number|null>(null)

  async function load(){
    try{
      const res = await fetch('/api/applications/', { headers:{'Authorization': 'Bearer '+localStorage.getItem('access')} })
      if(!res.ok) throw new Error('Failed to load applications')
      const data = await res.json()
      setApps(data || [])
    }catch(err:any){ toast.error(err.message || 'Error loading applications') }
  }
  useEffect(()=>{ load() }, [])

  const byStatus = useMemo(()=>{
    const map: Record<string, Application[]> = {}
    for(const s of STATUSES) map[s] = []
    for(const a of apps){
      const s = (a.status || 'saved') as string
      if(!map[s]) map[s] = []
      map[s].push(a)
    }
    return map
  }, [apps])

  function onDragStart(e: React.DragEvent, app: Application){
    e.dataTransfer.setData('text/plain', String(app.id))
    setDraggingId(app.id)
  }

  function onDragOver(e: React.DragEvent){ e.preventDefault() }

  async function moveToStatus(appId: string|number, newStatus: string){
    setApps(prev => prev.map(a => a.id===appId ? { ...a, status: newStatus } : a))
    try{
      const res = await fetch(`/api/applications/${appId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('access') },
        body: JSON.stringify({ status: newStatus })
      })
      if(!res.ok) throw new Error('Failed to update status')
      toast.success('Status updated')
    }catch(err:any){
      toast.error(err.message || 'Could not save status, reverting')
      // reload to revert
      load()
    }
  }

  function onDrop(e: React.DragEvent, status: string){
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if(!id) return
    moveToStatus(id, status)
    setDraggingId(null)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Application Tracker</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop applications between columns to update status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <div key={status} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{status.replace('_',' ')}</h3>
                <span className="badge badge-secondary">{byStatus[status]?.length || 0}</span>
              </div>
            </div>
            <div
              className="card-body min-h-[240px]"
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e, status)}
            >
              <div className="space-y-3">
                {byStatus[status]?.map(app => (
                  <div
                    key={app.id}
                    className={`p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm cursor-move ${draggingId===app.id? 'opacity-70' : ''}`}
                    draggable
                    onDragStart={(e)=>onDragStart(e, app)}
                    title="Drag to another column"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{app.title || `Application ${app.id}`}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{app.company ? app.company : (app.job ? `Job ${app.job}` : '')}</div>
                  </div>
                ))}
                {(!byStatus[status] || byStatus[status].length===0) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Drop items here</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
