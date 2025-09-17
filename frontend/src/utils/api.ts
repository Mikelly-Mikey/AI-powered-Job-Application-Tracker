import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL - adjust based on your backend setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    first_name?: string;
    last_name?: string;
  }) => api.post('/auth/register/', data),

  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },

  getCurrentUser: () => api.get('/auth/me/'),

  updateProfile: (data: any) => api.put('/auth/me/', data),

  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => api.post('/auth/change-password/', data),
};

export const jobsAPI = {
  getJobs: (params?: {
    page?: number;
    search?: string;
    location?: string;
    job_type?: string;
    remote_type?: string;
    salary_min?: number;
    salary_max?: number;
  }) => api.get('/jobs/', { params }),

  getJob: (jobId: string) => api.get(`/jobs/${jobId}/`),

  searchJobs: (query: string) => api.get(`/jobs/search/?q=${query}`),

  getRecommendations: (userId: string) =>
    api.get(`/recommendations/user/${userId}/`),
};

export const applicationsAPI = {
  getApplications: (params?: {
    page?: number;
    status?: string;
    priority?: string;
  }) => api.get('/applications/', { params }),

  getApplication: (applicationId: string) =>
    api.get(`/applications/${applicationId}/`),

  createApplication: (data: {
    job_id: string;
    status?: string;
    notes?: string;
    application_method?: string;
  }) => api.post('/applications/', data),

  updateApplication: (applicationId: string, data: any) =>
    api.put(`/applications/${applicationId}/`, data),

  deleteApplication: (applicationId: string) =>
    api.delete(`/applications/${applicationId}/`),

  updateStatus: (applicationId: string, status: string, description?: string) =>
    api.patch(`/applications/${applicationId}/status/`, { status, description }),

  scheduleInterview: (applicationId: string, interviewData: any) =>
    api.post(`/applications/${applicationId}/interviews/`, interviewData),

  addNote: (applicationId: string, note: string) =>
    api.post(`/applications/${applicationId}/notes/`, { note }),

  uploadDocument: (applicationId: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return api.post(`/applications/${applicationId}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const resumesAPI = {
  getResumes: () => api.get('/resumes/'),

  getResume: (resumeId: string) => api.get(`/resumes/${resumeId}/`),

  uploadResume: (file: File, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    return api.post('/resumes/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateResume: (resumeId: string, data: any) =>
    api.put(`/resumes/${resumeId}/`, data),

  deleteResume: (resumeId: string) => api.delete(`/resumes/${resumeId}/`),

  setPrimary: (resumeId: string) =>
    api.patch(`/resumes/${resumeId}/set-primary/`),

  analyzeResume: (resumeId: string) =>
    api.post(`/resumes/${resumeId}/analyze/`),
};

export const insightsAPI = {
  getDashboard: () => api.get('/insights/dashboard/'),

  getApplicationStats: (timeframe?: string) =>
    api.get('/insights/applications/', { params: { timeframe } }),

  getJobMarketTrends: (location?: string, industry?: string) =>
    api.get('/insights/market-trends/', { params: { location, industry } }),

  getSalaryInsights: (title?: string, location?: string) =>
    api.get('/insights/salary/', { params: { title, location } }),
};

// Utility functions
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 400) {
      return data.error || 'Invalid request data';
    } else if (status === 401) {
      return 'Authentication required';
    } else if (status === 403) {
      return 'Access denied';
    } else if (status === 404) {
      return 'Resource not found';
    } else if (status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return data.error || `Error ${status}: ${data.message || 'Unknown error'}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access');
  if (!token) return false;

  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export const getUserFromToken = () => {
  const token = localStorage.getItem('access');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user_id: payload.user_id,
      username: payload.username,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};

export default api;