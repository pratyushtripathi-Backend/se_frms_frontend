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

// Topics are fixed and all subscribed on (re)connect:
//   /topic/alerts                   - each new DASHBOARD alert
//   /topic/notification-read-state  - { unreadCount } after any admin marks all as read
const ALERTS_TOPIC = '/topic/alerts'
const READ_STATE_TOPIC = '/topic/notification-read-state'
const listenersByTopic = {
  [ALERTS_TOPIC]: new Set(),
  [READ_STATE_TOPIC]: new Set(),
}
const connectListeners = new Set()

function subscribeToTopic(topic, onMessage) {
  listenersByTopic[topic].add(onMessage)
  ensureConnected()
  return () => {
    listenersByTopic[topic].delete(onMessage)
  }
}

function ensureConnected() {
  if (stompClient) {
    return stompClient
  }

  console.log('[notificationSocket] connecting to', WS_URL)

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[notificationSocket] connected, subscribing to', Object.keys(listenersByTopic).join(', '))
      Object.entries(listenersByTopic).forEach(([topic, listeners]) => {
        stompClient.subscribe(topic, (message) => {
          let payload
          try {
            payload = JSON.parse(message.body)
          } catch (error) {
            console.error('[notificationSocket] failed to parse payload from', topic, error)
            return
          }
          listeners.forEach((listener) => listener(payload))
        })
      })
      // Lets subscribers re-sync state that may have changed while disconnected.
      connectListeners.forEach((listener) => listener())
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
  return subscribeToTopic(ALERTS_TOPIC, onAlert)
}

/**
 * Subscribe to shared read-state changes: called with { unreadCount } whenever
 * any admin marks all notifications as read. Returns an unsubscribe function.
 */
export function subscribeToReadState(onReadState) {
  return subscribeToTopic(READ_STATE_TOPIC, onReadState)
}

/**
 * Called every time the socket (re)connects - use it to re-fetch anything
 * that may have been missed while disconnected. Returns an unsubscribe function.
 */
export function onSocketConnect(onConnect) {
  connectListeners.add(onConnect)
  ensureConnected()
  return () => {
    connectListeners.delete(onConnect)
  }
}
