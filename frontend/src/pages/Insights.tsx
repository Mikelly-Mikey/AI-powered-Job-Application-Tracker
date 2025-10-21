import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Gap = { job_id: string; missing_keywords: string[]; coverage: number };
type Application = { id: string|number; status: string; applied_date?: string|null };

export default function Insights() {
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<Gap | null>(null);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    (async function loadApps(){
      setAppsLoading(true);
      try{
        const res = await fetch('/api/applications/', { headers:{ 'Authorization':'Bearer '+localStorage.getItem('access') } })
        if(!res.ok) throw new Error('Failed to load applications')
        const data = await res.json()
        setApps(data || [])
      }catch(err:any){ toast.error(err.message || 'Error loading applications') }
      finally{ setAppsLoading(false) }
    })();
  }, []);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of apps) {
      const s = (a.status || 'unknown').replace(' ', '_')
      map[s] = (map[s] || 0) + 1
    }
    return Object.entries(map).map(([status, count]) => ({ status, count }))
  }, [apps]);

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of apps) {
      if (!a.applied_date) continue
      const d = new Date(a.applied_date)
      if (isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      map[key] = (map[key] || 0) + 1
    }
    const entries = Object.entries(map).sort(([a],[b]) => a.localeCompare(b))
    return entries.map(([month, count]) => ({ month, count }))
  }, [apps]);

  const analyze = async () => {
    if (!jobId.trim()) {
      toast.error('Enter a Job ID to analyze');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/insights/gap/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access')
        },
        body: JSON.stringify({ job_id: jobId })
      });
      if (!res.ok) throw new Error('Failed to compute gap');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insights</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Track your job search and analyze skills coverage.</p>
      </div>

      {/* Dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Applications by Status</h3>
          </div>
          <div className="card-body h-72">
            {appsLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="status" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Applications Over Time</h3>
          </div>
          <div className="card-body h-72">
            {appsLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10b981" name="Applied" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Skills gap tool */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills Gap Analysis</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="input sm:flex-1"
              placeholder="Enter Job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
            <button className="btn-primary" onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {result && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-200">Coverage</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.round((result.coverage || 0) * 100)}%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.round((result.coverage || 0) * 100)}%` }} />
              </div>

              <h4 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">Missing Skills</h4>
              {result.missing_keywords?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.missing_keywords.map((k) => (
                    <span key={k} className="badge badge-secondary">{k}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">No missing skills detected. Great job!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
