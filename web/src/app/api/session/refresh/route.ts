import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { AuthTokens } from '@/lib/api/schema'
import {
  clearTokens,
  envelopeError,
  isSameOrigin,
  readTokens,
  serverApi,
  storeTokens,
} from '@/lib/session/server'

export const dynamic = 'force-dynamic'

/**
 * Refresh tokens are single-use: presenting one twice revokes the session. Two
 * tabs can still refresh within the same moment, so within this server process
 * the same old token shares one API call for a few seconds. The window is short
 * (a stolen token replayed inside it gets the same answer), the key is a hash
 * (raw tokens aren't kept), and only successes are reused.
 */
const REUSE_MS = 5_000
type Outcome = { tokens: AuthTokens } | { status: number }
const recent = new Map<string, Promise<Outcome>>()

const refresh = async (refreshToken: string): Promise<Outcome> => {
  const key = createHash('sha256').update(refreshToken).digest('hex')
  const known = recent.get(key)
  if (known) return known
  const pending = (async (): Promise<Outcome> => {
    try {
      const { data, response } = await (
        await serverApi()
      ).POST('/api/v1/auth/refresh', { body: { refreshToken } })
      return response.ok && data?.success && data.data
        ? { tokens: data.data }
        : { status: response.status }
    } catch {
      return { status: 502 }
    }
  })()
  recent.set(key, pending)
  const outcome = await pending
  if ('tokens' in outcome) setTimeout(() => recent.delete(key), REUSE_MS)
  else recent.delete(key)
  return outcome
}

export const POST = async (request: NextRequest) => {
  if (!isSameOrigin(request)) {
    return NextResponse.json(envelopeError('FORBIDDEN', 'Not allowed.'), {
      status: 403,
    })
  }

  const { refreshToken } = await readTokens()
  const outcome: Outcome = refreshToken
    ? await refresh(refreshToken)
    : { status: 401 }
  if (!('tokens' in outcome)) {
    // Only a refusal ends the session here. A rate limit or an outage keeps the
    // cookies, so a busy or unreachable API doesn't sign everyone out.
    if (outcome.status === 401) {
      await clearTokens()
      return NextResponse.json(
        envelopeError('UNAUTHORIZED', 'Your session has ended. Sign in again.'),
        { status: 401 }
      )
    }
    return NextResponse.json(
      envelopeError(
        'API_UNREACHABLE',
        'UniSync is busy or not reachable right now. Try again in a moment.'
      ),
      { status: 503 }
    )
  }

  await storeTokens(outcome.tokens)
  return NextResponse.json({ success: true }, { status: 200 })
}
