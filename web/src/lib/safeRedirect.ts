/**
 * Only allow same-origin path redirects. Rejects absolute URLs, protocol-relative
 * `//evil.com`, backslash tricks like `/\\evil.com`, and control characters: the
 * URL parser strips tabs and newlines, so `/\t/evil.com` would become `//evil.com`.
 */
const BASE = 'http://local.invalid'

export const safeRedirectPath = (
  value: string | null | undefined,
  fallback = '/'
): string => {
  if (!value || !value.startsWith('/')) return fallback
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback
  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
