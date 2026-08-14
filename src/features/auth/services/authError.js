export function getAuthErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data

  const normalizedMessage = normalizeMessage(responseData)

  if (normalizedMessage) {
    return normalizedMessage
  }

  if (!error?.response && typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return fallbackMessage
}

function normalizeMessage(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return value.map(normalizeMessage).filter(Boolean).join(', ')
  }

  if (typeof value !== 'object') {
    return ''
  }

  const directMessage =
    value.responseMessage ??
    value.message ??
    value.msg ??
    value.errorMessage ??
    value.error_description ??
    value.description ??
    value.reason ??
    value.detail ??
    value.details ??
    value.error

  const directText = normalizeMessage(directMessage)

  if (directText) {
    return directText
  }

  const nestedMessage =
    normalizeMessage(value.data) ||
    normalizeMessage(value.errors) ||
    normalizeMessage(value.errorList)

  if (nestedMessage) {
    return nestedMessage
  }

  return Object.values(value).map(normalizeMessage).filter(Boolean).join(', ')
}
