import createClient from 'openapi-fetch'
import type { paths } from './generated'

/**
 * The browser's API client. It calls this site's own `/api/v1/*` proxy, which
 * adds the access token from an httpOnly cookie; page scripts never see a token.
 *
 * On a 401 it asks `/api/session/refresh` to rotate the cookies, then retries
 * once. Refreshing happens here, once per tab, not in the proxy: refresh tokens
 * are single-use, and parallel requests each refreshing with the same token
 * would look like a replay and get the whole session revoked.
 */
let refreshing: Promise<boolean> | null = null

const refreshOnce = (): Promise<boolean> => {
  refreshing ??= fetch('/api/session/refresh', { method: 'POST' })
    .then(async (r) => {
      // Read the body so the connection is released.
      await r.text().catch(() => '')
      return r.ok
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

const signedOut = () => {
  const here = window.location.pathname + window.location.search
  window.location.assign(`/auth/login?redirect=${encodeURIComponent(here)}`)
}

const fetchWithRefresh = async (request: Request): Promise<Response> => {
  const retry = request.clone()
  const response = await fetch(request)
  if (response.status !== 401) return response
  if (!(await refreshOnce())) {
    signedOut()
    return response
  }
  await response.body?.cancel().catch(() => undefined)
  return fetch(retry)
}

export const api = createClient<paths>({
  baseUrl: '',
  fetch: fetchWithRefresh,
})
