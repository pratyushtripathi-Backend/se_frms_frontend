import apiClient from '../../../services/apiClient'

export function login(credentials) {
  return apiClient.post('/auth/login', credentials)
}

export function verifyOtp(payload) {
  return apiClient.post('/auth/verify-otp', payload)
}

export function forgotPassword(payload) {
  return apiClient.post('/auth/forgot-password', payload)
}
