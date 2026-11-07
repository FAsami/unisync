/**
 * The API server returns errors in two shapes:
 *   - REST:          { success: false, error: { message, code, details } }
 *   - action-style:  { message, extensions: { code, details } }   (/otp/*, /auth/account/delete)
 * Always read errors through this helper so either shape shows the real message.
 */
export const getApiErrorMessage = (body: unknown, fallback: string): string => {
  if (body && typeof body === 'object') {
    const b = body as {
      error?: { message?: unknown } | string
      message?: unknown
    }
    if (typeof b.error === 'object' && typeof b.error?.message === 'string') {
      return b.error.message
    }
    if (typeof b.error === 'string') return b.error
    if (typeof b.message === 'string' && b.message) return b.message
  }
  return fallback
}
