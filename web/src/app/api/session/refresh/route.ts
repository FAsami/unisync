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
 * tabs can still refresh at nearly the same moment, so within this server
 * process the same old token gets the same answer for a short while instead of
 * a second call to the API.
 */
const REUSE_MS = 30_000
const recent = new Map<string, Promise<AuthTokens | null>>()

const refresh = (refreshToken: string): Promise<AuthTokens | null> => {
  const known = recent.get(refreshToken)
  if (known) return known
  const pending = serverApi()
    .POST('/api/v1/auth/refresh', { body: { refreshToken } })
    .then(({ data, response }) =>
      response.ok && data?.success && data.data ? data.data : null
    )
    .catch(() => null)
  recent.set(refreshToken, pending)
  setTimeout(() => recent.delete(refreshToken), REUSE_MS)
  return pending
}

export const POST = async (request: NextRequest) => {
  if (!isSameOrigin(request)) {
    return NextResponse.json(envelopeError('FORBIDDEN', 'Not allowed.'), {
      status: 403,
    })
  }

  const { refreshToken } = await readTokens()
  const tokens = refreshToken ? await refresh(refreshToken) : null
  if (!tokens) {
    await clearTokens()
    return NextResponse.json(
      envelopeError('UNAUTHORIZED', 'Your session has ended. Sign in again.'),
      { status: 401 }
    )
  }

  await storeTokens(tokens)
  return NextResponse.json({ success: true }, { status: 200 })
}
