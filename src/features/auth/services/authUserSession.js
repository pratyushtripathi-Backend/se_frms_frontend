const AUTH_USER_KEY = 'frmsAuthUser'
const AUTH_TOKEN_KEY = 'frmsAuthToken'
const AUTH_TOKEN_EXPIRY_KEY = 'frmsAuthTokenExpiresAt'
const AUTH_REDIRECT_MESSAGE_KEY = 'frmsAuthRedirectMessage'
export const AUTH_SESSION_EXPIRED_EVENT = 'frms-auth-session-expired'

export function saveAuthUser(loginResponseData) {
  const currentUser = getAuthUser()
  const id =
    findFirstValue(loginResponseData, [
      'id',
      'userId',
      'user_id',
      'userID',
      'loggedInUserId',
    ]) ??
    currentUser.id ??
    ''
  const name =
    findFirstStringValue(loginResponseData, [
      'name',
      'fullName',
      'userName',
      'username',
      'displayName',
      'employeeName',
    ]) ??
    getStoredDisplayValue(currentUser.name) ??
    'User'

  const role =
    findFirstStringValue(loginResponseData, [
      'userRole',
      'role',
      'roleName',
      'authority',
      'userType',
    ]) ??
    getStoredDisplayValue(currentUser.role) ??
    'User'

  window.sessionStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      id,
      name,
      role,
    }),
  )
}

export function getAuthUser() {
  try {
    return JSON.parse(window.sessionStorage.getItem(AUTH_USER_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function saveAuthToken(responseData) {
  const token = findAuthToken(responseData)

  if (!token) {
    return ''
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  const expiresAt = getJwtExpiryTime(token)

  if (expiresAt) {
    window.sessionStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, String(expiresAt))
  } else {
    window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
  }

  return token
}

export function getAuthToken() {
  if (isAuthTokenExpired()) {
    expireAuthSession()
    return ''
  }

  return window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? ''
}

export function getAuthTokenExpiresAt() {
  const expiresAt = Number(window.sessionStorage.getItem(AUTH_TOKEN_EXPIRY_KEY))

  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : 0
}

export function isAuthTokenExpired() {
  const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY)
  const expiresAt = getAuthTokenExpiresAt()

  return Boolean(token && expiresAt && Date.now() >= expiresAt)
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
  window.sessionStorage.removeItem(AUTH_USER_KEY)
  window.sessionStorage.removeItem('frmsLoginEmail')
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function expireAuthSession() {
  clearAuthSession()
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}

export function forceAuthLogout(message = '', options = {}) {
  const { showLoginNotice = true } = options

  clearAuthSession()

  if (message && showLoginNotice) {
    window.sessionStorage.setItem(AUTH_REDIRECT_MESSAGE_KEY, message)
  } else {
    window.sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY)
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
      detail: {
        message: showLoginNotice ? message : '',
      },
    }),
  )
}

export function consumeAuthRedirectMessage() {
  const message = window.sessionStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY) ?? ''
  window.sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY)
  return message
}

function findAuthToken(value, visited = new Set()) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return ''
  }

  if (typeof value !== 'object' || visited.has(value)) {
    return ''
  }

  visited.add(value)

  const tokenKeys = [
    'accessToken',
    'access_token',
    'token',
    'jwt',
    'jwtToken',
    'bearerToken',
    'authToken',
    'idToken',
  ]

  for (const key of tokenKeys) {
    const token = value[key]

    if (typeof token === 'string' && token.trim()) {
      return token.replace(/^Bearer\s+/i, '').trim()
    }
  }

  for (const childValue of Object.values(value)) {
    const token = findAuthToken(childValue, visited)

    if (token) {
      return token
    }
  }

  return ''
}

function findFirstStringValue(value, keys, visited = new Set()) {
  if (!value || typeof value !== 'object' || visited.has(value)) {
    return undefined
  }

  visited.add(value)

  for (const key of keys) {
    const candidate = value[key]

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstStringValue(childValue, keys, visited)

    if (candidate) {
      return candidate
    }
  }

  return undefined
}

function findFirstValue(value, keys, visited = new Set()) {
  if (!value || typeof value !== 'object' || visited.has(value)) {
    return undefined
  }

  visited.add(value)

  for (const key of keys) {
    const candidate = value[key]

    if (candidate !== null && candidate !== undefined && candidate !== '') {
      return candidate
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstValue(childValue, keys, visited)

    if (candidate !== undefined) {
      return candidate
    }
  }

  return undefined
}

function getStoredDisplayValue(value) {
  if (typeof value !== 'string' || !value.trim() || value.includes('@')) {
    return undefined
  }

  return value.trim()
}

function getJwtExpiryTime(token) {
  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return 0
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = JSON.parse(window.atob(normalizedPayload))
    const expiresAtSeconds = Number(decodedPayload.exp)

    if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= 0) {
      return 0
    }

    return expiresAtSeconds * 1000
  } catch {
    return 0
  }
}
