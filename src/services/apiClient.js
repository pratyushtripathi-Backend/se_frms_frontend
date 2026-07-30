import axios from 'axios'
import {
  clearAuthSession,
  getAuthToken,
} from '../features/auth/services/authUserSession'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  const publicAuthEndpoints = [
    '/auth/login',
    '/auth/verify-otp',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]
  const requestPath = config.url?.split('?')[0]
  const isPublicAuthEndpoint = publicAuthEndpoints.includes(requestPath)

  if (token && !isPublicAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      getAuthToken() &&
      !error.config?.skipAuthRedirect
    ) {
      clearAuthSession()
      window.location.assign('/')
    }

    return Promise.reject(error)
  },
)

export default apiClient
