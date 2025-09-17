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
import { formatDate, formatRelativeTime, getStatusColor } from '../utils/helpers';

// Mock data - replace with actual API calls
const mockStats = {
  totalApplications: 24,
  activeApplications: 8,
  interviews: 3,
  offers: 1,
};

const mockRecentApplications = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    status: 'interviewing',
    appliedDate: '2024-01-15T10:00:00Z',
    nextStep: 'Technical Interview',
    nextStepDate: '2024-01-20T14:00:00Z',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Engineer',
    company: 'StartupXYZ',
    status: 'applied',
    appliedDate: '2024-01-12T09:30:00Z',
    nextStep: 'Waiting for response',
  },
  {
    id: '3',
    jobTitle: 'React Developer',
    company: 'Digital Agency',
    status: 'phone_screen',
    appliedDate: '2024-01-10T16:45:00Z',
    nextStep: 'Phone Screen',
    nextStepDate: '2024-01-18T11:00:00Z',
  },
];

const mockRecommendations = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'InnovateTech',
    location: 'San Francisco, CA',
    matchScore: 95,
    salary: '$120k - $150k',
    remote: true,
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'CloudSoft',
    location: 'New York, NY',
    matchScore: 88,
    salary: '$110k - $140k',
    remote: false,
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'DataFlow',
    location: 'Austin, TX',
    matchScore: 82,
    salary: '$100k - $130k',
    remote: true,
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const statCards = [
    {
      name: 'Total Applications',
      value: mockStats.totalApplications,
      icon: BriefcaseIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Active Applications',
      value: mockStats.activeApplications,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '+4%',
      changeType: 'increase',
    },
    {
      name: 'Interviews',
      value: mockStats.interviews,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      change: '+2',
      changeType: 'increase',
    },
    {
      name: 'Offers',
      value: mockStats.offers,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: '+1',
      changeType: 'increase',
    },
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.first_name || user?.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
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
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
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
                {mockRecentApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {application.jobTitle}
                          </h4>
                          <span className={`badge ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{application.company}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Applied {formatRelativeTime(application.appliedDate)}</span>
                          {application.nextStepDate && (
                            <span>• Next: {formatDate(application.nextStepDate, 'MMM dd')}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{application.nextStep}</p>
                        {application.nextStepDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(application.nextStepDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
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
              <div className="divide-y divide-gray-200">
                {mockRecommendations.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">{job.location}</span>
                          {job.remote && (
                            <span className="badge badge-success text-xs">Remote</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{job.salary}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">
                            {job.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/tracker?action=add"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200">
                  <PlusIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Add Application</p>
                  <p className="text-xs text-gray-500">Track a new job</p>
                </div>
              </Link>

              <Link
                to="/resumes"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Upload Resume</p>
                  <p className="text-xs text-gray-500">Update your profile</p>
                </div>
              </Link>

              <Link
                to="/recommendations"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="bg-yellow-100 p-2 rounded-lg group-hover:bg-yellow-200">
                  <SparklesIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Get Recommendations</p>
                  <p className="text-xs text-gray-500">AI-powered matches</p>
                </div>
              </Link>

              <Link
                to="/insights"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">View Insights</p>
                  <p className="text-xs text-gray-500">Track your progress</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}