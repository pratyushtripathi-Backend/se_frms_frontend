import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// notification-service's WebSocket endpoint. This connects DIRECTLY to
// notification-service, bypassing the API gateway - the same way the
// working manual test (websocket-test.html) did. The gateway's Eureka
// discovery-locator routing has not been verified to proxy SockJS/STOMP
// correctly, so this is the known-working path. Override via
// VITE_NOTIFICATION_WS_URL if notification-service runs somewhere else.
const WS_URL = import.meta.env.VITE_NOTIFICATION_WS_URL ?? 'http://localhost:8096/ws'

let stompClient = null
const listeners = new Set()

function ensureConnected() {
  if (stompClient) {
    return stompClient
  }

  console.log('[notificationSocket] connecting to', WS_URL)

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[notificationSocket] connected, subscribing to /topic/alerts')
      stompClient.subscribe('/topic/alerts', (message) => {
        console.log('[notificationSocket] alert received', message.body)
        let alert
        try {
          alert = JSON.parse(message.body)
        } catch (error) {
          console.error('[notificationSocket] failed to parse alert payload', error)
          return
        }
        listeners.forEach((listener) => listener(alert))
      })
    },
    onStompError: (frame) => {
      console.error('[notificationSocket] STOMP error', frame.headers?.message, frame.body)
    },
    onWebSocketError: (event) => {
      console.error('[notificationSocket] WebSocket error - is notification-service running/reachable at', WS_URL, event)
    },
    onDisconnect: () => {
      console.warn('[notificationSocket] disconnected')
    },
  })

  stompClient.activate()
  return stompClient
}

/**
 * Subscribe to live DASHBOARD notification alerts pushed by
 * notification-service over "/topic/alerts". Lazily connects on first
 * subscriber. Returns an unsubscribe function - call it on unmount.
 */
export function subscribeToAlerts(onAlert) {
  listeners.add(onAlert)
  ensureConnected()

  return () => {
    listeners.delete(onAlert)
  }
}
