/**
 * Reads a JWT's `exp` claim without verifying the signature. Only for UX
 * decisions (redirects, choosing which token to send); Hasura and the API
 * server do the real verification. Works in the browser, Node and the Edge
 * runtime (no Buffer).
 */
export const getJwtExpiry = (token: string): number | null => {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/** True when the token is malformed, has no exp, or expires within `skewSeconds`. */
export const isJwtExpired = (token: string, skewSeconds = 30): boolean => {
  const exp = getJwtExpiry(token)
  if (exp === null) return true
  return Date.now() / 1000 >= exp - skewSeconds
}
