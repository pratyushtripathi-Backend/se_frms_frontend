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
  (response) => {
    const logoutRequired = hasLogoutRequired(response.data)

    if (logoutRequired && !response.config?.skipAuthRedirect) {
      const message =
        findResponseMessage(response.data) ||
        'Your session has ended. Please login again.'

      showLogoutRequiredPopup(message)

      return response
    }

    return response
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      getAuthToken() &&
      !error.config?.skipAuthRedirect
    ) {
      showLogoutRequiredPopup(
        findResponseMessage(error.response?.data) ||
          'Your session has expired. Please login again.',
      )
    }

    return Promise.reject(error)
  },
)

export default apiClient

function showLogoutRequiredPopup(message) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  clearAuthSession()
  hideOpenDashboardModals()

  if (document.getElementById('frms-logout-required-popup')) {
    return
  }

  const overlay = document.createElement('div')
  overlay.id = 'frms-logout-required-popup'
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '3000'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.background = 'rgba(0, 0, 0, 0.5)'
  overlay.style.padding = '16px'

  const card = document.createElement('div')
  card.style.width = '420px'
  card.style.maxWidth = '92vw'
  card.style.borderRadius = '14px'
  card.style.background = '#ffffff'
  card.style.padding = '36px 32px'
  card.style.textAlign = 'center'
  card.style.boxShadow = '0 25px 60px rgba(15, 23, 42, 0.28)'

  const icon = document.createElement('div')
  icon.textContent = '✓'
  icon.style.width = '56px'
  icon.style.height = '56px'
  icon.style.margin = '0 auto 20px'
  icon.style.borderRadius = '999px'
  icon.style.display = 'flex'
  icon.style.alignItems = 'center'
  icon.style.justifyContent = 'center'
  icon.style.background = '#E7F8EF'
  icon.style.color = '#27AE60'
  icon.style.fontSize = '30px'
  icon.style.fontWeight = '800'

  const text = document.createElement('h3')
  text.textContent = String(message || 'PLEASE LOGIN AGAIN.').toUpperCase()
  text.style.margin = '0 auto'
  text.style.maxWidth = '340px'
  text.style.color = '#202224'
  text.style.fontFamily = 'Poppins, sans-serif'
  text.style.fontSize = '20px'
  text.style.fontWeight = '700'
  text.style.lineHeight = '1.4'

  window.setTimeout(() => {
    overlay.remove()
    window.location.replace('/')
  }, 2500)

  card.append(icon, text)
  overlay.append(card)
  document.body.append(overlay)
}

function hideOpenDashboardModals() {
  const modalSelectors = [
    '.fixed.inset-0.z-\\[1000\\]',
    '.fixed.inset-0.z-50',
    '.fixed.inset-0.z-\\[100\\]',
  ]

  document.querySelectorAll(modalSelectors.join(',')).forEach((element) => {
    if (element.id !== 'frms-logout-required-popup') {
      element.style.display = 'none'
    }
  })
}

function hasLogoutRequired(value, visited = new Set()) {
  if (!value || typeof value !== 'object' || visited.has(value)) {
    return false
  }

  visited.add(value)

  if (
    value.logoutRequired === true ||
    String(value.logoutRequired).toLowerCase() === 'true'
  ) {
    return true
  }

  return Object.values(value).some((childValue) =>
    hasLogoutRequired(childValue, visited),
  )
}

function findResponseMessage(value, visited = new Set()) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value !== 'object' || visited.has(value)) {
    return ''
  }

  visited.add(value)

  const directMessage =
    value.responseMessage ??
    value.message ??
    value.errorMessage ??
    value.detail

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage.trim()
  }

  for (const childValue of Object.values(value)) {
    const nestedMessage = findResponseMessage(childValue, visited)

    if (nestedMessage) {
      return nestedMessage
    }
  }

  return ''
}
