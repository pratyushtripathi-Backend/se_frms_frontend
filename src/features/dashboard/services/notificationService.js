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

// Unread dashboard notification count for the header bell. Read/unread is
// stored in the backend (shared by all admins), so it survives logout and
// cleared browser storage. Returns { unreadCount }.
export async function fetchUnreadCount() {
  const response = await apiClient.get(`${notificationApiBaseUrl}/notifications/unread-count`, {
    skipAuthRedirect: true,
  })
  return response.data
}

// Marks every notification as read (called when the notifications view is
// opened). Returns { unreadCount } after the update - normally 0.
export async function markAllNotificationsRead() {
  const response = await apiClient.patch(`${notificationApiBaseUrl}/notifications/read-all`, null, {
    skipAuthRedirect: true,
  })
  return response.data
}

// TEMPORARY: notification-service's NotificationTemplateController checks
// every /notification-templates request for an X-INTERNAL-API-KEY header
// (it has no login-token check), and returns 403 "Invalid internal API key"
// otherwise. Until the backend accepts the login token there, the frontend
// sends that header.
//
// The expected key is the backend's `notification.monolith.internal-api-key`
// = ${INTERNAL_API_KEY:local-internal-key}. In local dev the backend default
// `local-internal-key` is used automatically; if the backend runs with a real
// INTERNAL_API_KEY, set VITE_INTERNAL_API_KEY to the same value in .env.local.
// Note: anything sent from the browser is visible to users — remove this once
// the backend is fixed.
const INTERNAL_API_KEY_HEADER = 'X-INTERNAL-API-KEY'
const internalApiKey =
  import.meta.env.VITE_INTERNAL_API_KEY ||
  (import.meta.env.DEV ? 'local-internal-key' : undefined)

function internalApiKeyHeaders() {
  if (!internalApiKey) {
    console.warn(
      '[notificationService] VITE_INTERNAL_API_KEY is not set — ' +
        '/notification-templates calls will be rejected with "Invalid internal API key".',
    )
    return {}
  }

  return { [INTERNAL_API_KEY_HEADER]: internalApiKey }
}

// Notification Review / Block Email format templates (Email Format page).
// These live on the notification service, not the admin service that
// apiClient's default base URL points at — calling them without
// notificationApiBaseUrl returns 404 "API not found".
// Unlike the fetchers above, these return the full axios response, to match
// how EmailFormatPage reads `response.data`.
export function getNotificationTemplates() {
  return apiClient.get(`${notificationApiBaseUrl}/notification-templates`, {
    headers: internalApiKeyHeaders(),
    skipAuthRedirect: true,
  })
}

export function createNotificationTemplate(payload) {
  return apiClient.post(`${notificationApiBaseUrl}/notification-templates`, payload, {
    headers: internalApiKeyHeaders(),
    skipAuthRedirect: true,
  })
}

// PATCH /api/v1/notification-templates/{templateId}
// payload: { subjectTemplate, bodyTemplate }
export function updateNotificationTemplate(templateId, payload) {
  return apiClient.patch(`${notificationApiBaseUrl}/notification-templates/${templateId}`, payload, {
    headers: internalApiKeyHeaders(),
    skipAuthRedirect: true,
  })
}
