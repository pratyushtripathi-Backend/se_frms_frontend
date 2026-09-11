import apiClient from '../../../services/apiClient'

// REST reads (list/history) for notifications live on this service.
// Override via VITE_NOTIFICATION_API_BASE_URL if it runs somewhere else.
const notificationApiBaseUrl =
  import.meta.env.VITE_NOTIFICATION_API_BASE_URL ?? 'http://localhost:8085/api/v1'

// Initial/historical load for the "Real Time Alert Feed" widget - live
// updates after this come from notificationSocket.js's WebSocket subscription.
export async function fetchDashboardAlerts({ page = 0, size = 5 } = {}) {
  const response = await apiClient.get(`${notificationApiBaseUrl}/notifications/dashboard/feed`, {
    params: { page, size },
    skipAuthRedirect: true,
  })
  return response.data
}

// Initial/historical load for the "All Notification" / "Notification Record" page.
export async function fetchNotifications(params = {}) {
  const response = await apiClient.get(`${notificationApiBaseUrl}/notifications`, {
    params,
    skipAuthRedirect: true,
  })
  return response.data
}
