import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// Permits API
export const permitsAPI = {
  getAll: (params) => api.get('/permits', { params }),
  getById: (id) => api.get(`/permits/${id}`),
  create: (data) => api.post('/permits', data),
  update: (id, data) => api.put(`/permits/${id}`, data),
  delete: (id) => api.delete(`/permits/${id}`),
  getWorkTypes: () => api.get('/permits/work-types'),
}

// Approvals API
export const approvalsAPI = {
  getAll: (params) => api.get('/approvals', { params }),
  getById: (id) => api.get(`/approvals/${id}`),
  updateDecision: (id, data) => api.put(`/approvals/${id}/decision`, data),
  getPendingCount: () => api.get('/approvals/pending-count'),
  getStats: () => api.get('/approvals/stats'),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: (params) => api.get('/dashboard/activity', { params }),
}
