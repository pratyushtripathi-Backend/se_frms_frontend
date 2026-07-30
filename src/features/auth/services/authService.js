import apiClient from '../../../services/apiClient'
import { getClientAuthMetadataHeaders } from './clientAuthMetadata'

export function login(credentials) {
  return apiClient.post('/auth/login', credentials, {
    headers: getClientAuthMetadataHeaders(credentials),
  })
}

export function verifyOtp(payload) {
  return apiClient.post('/auth/verify-otp', payload, {
    headers: getClientAuthMetadataHeaders(payload),
  })
}

export function forgotPassword(payload) {
  return apiClient.post('/auth/forgot-password', payload)
}

export function resetPassword(payload) {
  return apiClient.post('/auth/reset-password', payload)
}

export function changePassword(payload) {
  return apiClient.post('/auth/change-password', payload)
}

export function logout() {
  return apiClient.post('/auth/logout')
}
