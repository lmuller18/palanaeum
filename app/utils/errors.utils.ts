type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  const hasMessageProperty =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'

  if (hasMessageProperty) {
    const e = error as ErrorWithMessage
    if (e.message.length === 0) return false
    return true
  }
  return false
}

function toErrorWithMessage(
  maybeError: unknown,
  fallback?: string,
): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  if (fallback) return new Error(fallback)

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown, fallback?: string) {
  return toErrorWithMessage(error, fallback).message
}
