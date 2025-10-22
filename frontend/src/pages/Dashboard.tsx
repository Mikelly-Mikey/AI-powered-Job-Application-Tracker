import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime, getStatusColor } from '../utils/helpers';


export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadApps();
    checkResumeAndMaybeLoadRecs();
  }, []);

  async function loadApps() {
    setAppsLoading(true);
    try {
      const res = await fetch('/api/applications/', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access') }
      });
      if (!res.ok) throw new Error('Failed to load applications');
      const data = await res.json();
      setApps(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setApps([]);
    } finally {
      setAppsLoading(false);
    }
  }

  async function checkResumeAndMaybeLoadRecs() {
    try {
      const res = await fetch('/api/resumes/list/', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access') }
      });
      if (!res.ok) {
        setHasResume(false);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      const has = (list?.length || 0) > 0;
      setHasResume(has);
      if (has) {
        refreshRecs();
      }
    } catch {
      setHasResume(false);
    }
  }

  async function refreshRecs() {
    setRecsLoading(true);
    try {
      const res = await fetch('/api/recommendations/refresh/', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access') }
      });
      if (!res.ok) throw new Error('Failed to refresh recommendations');
      const data = await res.json();
      setRecs(data.results || []);
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }

  const totalApplications = apps.length;
  const activeApplications = apps.filter(a => ['applied','phone_screen','interviewing','offer']
    .includes(String(a.status || '').toLowerCase())).length;
  const interviews = apps.filter(a => ['phone_screen','interviewing']
    .includes(String(a.status || '').toLowerCase())).length;
  const offers = apps.filter(a => ['offer','accepted']
    .includes(String(a.status || '').toLowerCase())).length;

  const statCards = [
    { name: 'Total Applications', value: totalApplications, icon: BriefcaseIcon, color: 'bg-blue-500', change: '', changeType: 'increase' },
    { name: 'Active Applications', value: activeApplications, icon: ClockIcon, color: 'bg-yellow-500', change: '', changeType: 'increase' },
    { name: 'Interviews', value: interviews, icon: DocumentTextIcon, color: 'bg-purple-500', change: '', changeType: 'increase' },
    { name: 'Offers', value: offers, icon: CheckCircleIcon, color: 'bg-green-500', change: '', changeType: 'increase' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.profile?.first_name || user?.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here's what's happening with your job search today.
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card hover:shadow-medium transition-shadow duration-200"
          >
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Applications</h3>
                <Link
                  to="/tracker"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-gray-200">
                {appsLoading && (
                  <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading…</div>
                )}
                {!appsLoading && totalApplications === 0 && (
                  <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No applications yet.</div>
                )}
                {!appsLoading && totalApplications > 0 && (
                  [...apps]
                    .sort((a,b)=> new Date(b.applied_date || b.created_at || 0).getTime() - new Date(a.applied_date || a.created_at || 0).getTime())
                    .slice(0,5)
                    .map((application:any) => (
                      <div key={application.id || application.application_id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {application.title || application.job_title || `Application ${application.id || application.application_id}`}
                              </h4>
                              <span className={`badge ${getStatusColor(String(application.status || '').toLowerCase())}`}>
                                {String(application.status || '').replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{application.company || application.company_name || ''}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {(application.applied_date || application.created_at) && (
                                <span>Applied {formatRelativeTime(application.applied_date || application.created_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Recommendations</h3>
                </div>
                <Link
                  to="/recommendations"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              {!hasResume && (
                <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                  Upload your resume to get AI recommendations.
                  <Link to="/resumes" className="ml-2 text-primary-600 hover:text-primary-500">Upload now</Link>
                </div>
              )}
              {hasResume && (
                <div className="divide-y divide-gray-200">
                  <div className="flex items-center justify-between p-2">
                    <button className="btn-secondary btn-sm" onClick={refreshRecs} disabled={recsLoading}>{recsLoading ? 'Refreshing…' : 'Refresh'}</button>
                    <Link to="/recommendations" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View all</Link>
                  </div>
                  {recsLoading && (
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading…</div>
                  )}
                  {!recsLoading && recs.length === 0 && (
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-300">No recommendations yet. Try uploading or updating your resume text.</div>
                  )}
                  {!recsLoading && recs.slice(0,3).map((job:any) => (
                    <div key={job.job_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{job.company}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {job.location && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{job.location}</span>
                            )}
                            {job.remote_type && (
                              <span className="badge badge-success text-xs">{job.remote_type}</span>
                            )}
                          </div>
                          {job.salary && (job.salary.min || job.salary.max) && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {(job.salary.currency || 'USD')} {job.salary.min ?? ''}{job.salary.min && job.salary.max ? ' - ' : ''}{job.salary.max ?? ''} {job.salary.type ? `(${job.salary.type})` : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-600">
                              {Math.round((job.score || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/tracker?action=add"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
              >
                <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200">
                  <PlusIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Add Application</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Track a new job</p>
                </div>
              </Link>

              <Link
                to="/resumes"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
              >
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Upload Resume</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your profile</p>
                </div>
              </Link>

              <Link
                to="/recommendations"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
              >
                <div className="bg-yellow-100 p-2 rounded-lg group-hover:bg-yellow-200">
                  <SparklesIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Get Recommendations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered matches</p>
                </div>
              </Link>

              <Link
                to="/insights"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
              >
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">View Insights</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Track your progress</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}