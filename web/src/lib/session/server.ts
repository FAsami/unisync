import createClient from 'openapi-fetch'
import { cookies, headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import type { paths } from '@/lib/api/generated'
import type { AuthTokens } from '@/lib/api/schema'

/**
 * Server-side session handling: the tokens live only in httpOnly cookies and
 * are read here, in server actions and route handlers. Never import this from
 * a client component.
 */
export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'

/** The API's origin, e.g. https://api.uni-sync.site (paths carry /api/v1). */
export const apiUrl = (): string => {
  const url = process.env.API_URL
  if (!url) throw new Error('API_URL is not configured')
  return url.replace(/\/+$/, '')
}

/**
 * The API rate-limits sign-in per client address. Every call from this server
 * would otherwise share the server's address (one bucket for every admin), so
 * the real client address is forwarded, signed with API_PROXY_SECRET (the
 * API's RateLimits__TrustedProxySecret). Set the secret only where the host
 * sets x-real-ip / x-forwarded-for itself (Vercel does), or clients could pick
 * their own address.
 */
export const forwardedClientHeaders = (
  incoming: Pick<Headers, 'get'>
): Record<string, string> => {
  const secret = process.env.API_PROXY_SECRET
  const ip =
    incoming.get('x-real-ip') ??
    incoming.get('x-forwarded-for')?.split(',')[0]?.trim()
  return secret && ip
    ? { 'X-UniSync-Client-IP': ip, 'X-UniSync-Proxy-Secret': secret }
    : {}
}

/** A typed client for calls made by this server (not the browser). */
export const serverApi = async (accessToken?: string) =>
  createClient<paths>({
    baseUrl: apiUrl(),
    headers: {
      ...forwardedClientHeaders(await headers()),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: 'no-store',
  })

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  expires,
})

/**
 * Both cookies live as long as the refresh token. The API, not the cookie,
 * decides when an access token has expired (the client then refreshes).
 */
export const storeTokens = async (tokens: AuthTokens) => {
  const jar = await cookies()
  const expires = new Date(tokens.refreshTokenExpiresAt)
  jar.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(expires))
  jar.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(expires))
}

export const clearTokens = async () => {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

export const readTokens = async () => {
  const jar = await cookies()
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value,
    refreshToken: jar.get(REFRESH_COOKIE)?.value,
  }
}

/**
 * Cookie-authenticated endpoints must not be callable from other sites. Lax
 * cookies already stop cross-site POST/PUT/PATCH/DELETE; this checks the
 * browser's own provenance headers as well.
 */
export const isSameOrigin = (request: NextRequest): boolean => {
  const site = request.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin'
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** An error in the API's envelope shape, for responses this server makes itself. */
export const envelopeError = (code: string, message: string) => ({
  success: false,
  message: null,
  data: null,
  error: { code, message },
  meta: { timestamp: new Date().toISOString() },
})
