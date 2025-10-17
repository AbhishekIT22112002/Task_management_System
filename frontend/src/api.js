import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 second timeout
})

// Request interceptor to attach token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          if (window.location.pathname !== '/auth') {
            toast.error('Session expired. Please log in again.')
            window.location.href = '/auth'
          }
          break
        case 403:
          toast.error('You do not have permission to perform this action.')
          break
        case 404:
          toast.error('The requested resource was not found.')
          break
        case 409:
          toast.error('Conflict: ' + (data?.error || data?.message || 'Resource conflict'))
          break
        case 422:
          toast.error('Invalid data: ' + (data?.error || data?.message || 'Validation failed'))
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(data?.error || data?.message || 'An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your internet connection.')
    } else {
      // Other errors
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

export const aiSummarize = async (projectId) => {
  const { data } = await api.post('/ai/summarize', { projectId })
  return data
}

export const aiAsk = async (projectId, question) => {
  const { data } = await api.post('/ai/ask', { projectId, question })
  return data
}

export default api
