/**
 * Only allow same-origin, absolute-path redirects. Rejects `https://evil.com`,
 * protocol-relative `//evil.com`, and backslash tricks like `/\evil.com`.
 */
export const safeRedirectPath = (
  value: string | null | undefined,
  fallback = '/'
): string => {
  if (!value) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
