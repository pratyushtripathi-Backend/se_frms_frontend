const GEOLOCATION_CACHE_KEY = 'frmsClientCoordinates'
const GEOLOCATION_TIMEOUT_MS = 12000

export async function getClientAuthMetadata() {
  const coordinates = await getBrowserCoordinates()
  const latitude = coordinates?.latitude ?? null
  const longitude = coordinates?.longitude ?? null

  return {
    macAddress: null,
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    loginLatitude: latitude,
    loginLongitude: longitude,
    location: {
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
    },
    locationAccuracy: coordinates?.accuracy ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: window.navigator.platform,
    userAgent: window.navigator.userAgent,
  }
}

export async function getRequiredClientAuthMetadata() {
  return getClientAuthMetadata()
}

export function getClientAuthMetadataHeaders(metadata) {
  if (!metadata?.latitude || !metadata?.longitude) {
    return {}
  }

  return {
    'X-Client-Latitude': String(metadata.latitude),
    'X-Client-Longitude': String(metadata.longitude),
    'X-Client-Location-Accuracy': String(metadata.locationAccuracy ?? ''),
    'X-Client-Timezone': metadata.timezone ?? '',
    'X-Client-Platform': metadata.platform ?? '',
  }
}

function getBrowserCoordinates() {
  if (!window.navigator.geolocation) {
    return Promise.resolve(getCachedCoordinates())
  }

  return new Promise((resolve) => {
    let isSettled = false
    const resolveOnce = (value) => {
      if (isSettled) {
        return
      }

      isSettled = true
      resolve(value)
    }

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }

        cacheCoordinates(coordinates)
        resolveOnce(coordinates)
      },
      () => {
        resolveOnce(getCachedCoordinates())
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    )
  })
}

function getCachedCoordinates() {
  try {
    return JSON.parse(window.sessionStorage.getItem(GEOLOCATION_CACHE_KEY))
  } catch {
    return null
  }
}

function cacheCoordinates(coordinates) {
  window.sessionStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(coordinates))
}
