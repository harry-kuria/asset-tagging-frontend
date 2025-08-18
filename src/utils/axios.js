import axios from 'axios'

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 10000,
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken')
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear storage and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentCompany')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 