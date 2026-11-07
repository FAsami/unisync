/**
 * The app's one session: stores the token pair, refreshes it (one refresh in
 * flight at a time, shared by every caller), and tells listeners when the user
 * is signed in or out. Replaces the old lib/auth.ts + utils/token.ts pair.
 *
 * Storage and fetch are injected so this runs unchanged under Jest and Node.
 */

export interface TokenStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export interface Tokens {
  sessionId: string
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  role: string
}

export type SignOutReason = 'user' | 'revoked' | 'expired'

export type SessionEvent = { type: 'signed-in'; tokens: Tokens } | { type: 'signed-out'; reason: SignOutReason }

export interface Claims {
  userId: string
  role: string
  sessionId: string
}

const KEY = 'unisync.session.v1'
/** Refresh this long before the access token expires, so requests never race expiry. */
const EARLY_REFRESH_MS = 60_000

const decodeClaims = (jwt: string): Claims | null => {
  try {
    const part = jwt.split('.')[1]
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(globalThis.atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4)))
    return typeof json.userId === 'string' && typeof json.sessionId === 'string'
      ? { userId: json.userId, role: String(json.role ?? ''), sessionId: json.sessionId }
      : null
  } catch {
    return null
  }
}

export const createSession = (options: {
  storage: TokenStorage
  /** API origin, e.g. https://api.uni-sync.site (paths carry /api/v1). */
  apiUrl: string
  fetch?: typeof fetch
  now?: () => number
}) => {
  const { storage, apiUrl } = options
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis)
  const now = options.now ?? Date.now
  const listeners = new Set<(event: SessionEvent) => void>()
  let cached: Tokens | null | undefined
  let refreshing: Promise<Tokens | null> | null = null

  const emit = (event: SessionEvent) => listeners.forEach((l) => l(event))

  const load = async (): Promise<Tokens | null> => {
    if (cached === undefined) {
      const raw = await storage.get(KEY)
      try {
        cached = raw ? (JSON.parse(raw) as Tokens) : null
      } catch {
        cached = null
      }
    }
    return cached
  }

  const save = async (tokens: Tokens | null) => {
    cached = tokens
    if (tokens) await storage.set(KEY, JSON.stringify(tokens))
    else await storage.remove(KEY)
  }

  const end = async (reason: SignOutReason) => {
    await save(null)
    emit({ type: 'signed-out', reason })
  }

  /** One network refresh, whoever asks. Returns null when the session is over. */
  const refresh = (): Promise<Tokens | null> => {
    refreshing ??= (async () => {
      const current = await load()
      if (!current) return null
      let response: Response
      try {
        response = await doFetch(`${apiUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        })
      } catch {
        return current // offline: keep the session, the caller decides what to do
      }

      const body = await response.json().catch(() => null)
      if (response.ok && body?.success && body.data) {
        await save(body.data as Tokens)
        return body.data as Tokens
      }
      if (response.status === 401 || response.status === 400) {
        await end(body?.error?.code === 'SESSION_REVOKED' ? 'revoked' : 'expired')
        return null
      }
      return current // server trouble: try again on the next request
    })().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  return {
    /** A usable access token, refreshing it first when it's about to expire. Null when signed out. */
    async getAccessToken(): Promise<string | null> {
      const tokens = await load()
      if (!tokens) return null
      if (Date.parse(tokens.accessTokenExpiresAt) - now() > EARLY_REFRESH_MS) return tokens.accessToken
      const fresh = await refresh()
      if (!fresh) return null
      return Date.parse(fresh.accessTokenExpiresAt) > now() ? fresh.accessToken : null
    },

    /** Forces a refresh (after the server answered TOKEN_EXPIRED). */
    async refreshAccessToken(): Promise<string | null> {
      return (await refresh())?.accessToken ?? null
    },

    async signIn(tokens: Tokens): Promise<void> {
      await save(tokens)
      emit({ type: 'signed-in', tokens })
    },

    /**
     * Signs out locally, and on the server when reachable. With a deviceId the
     * server also stops pushes to this phone in the same call.
     */
    async signOut(deviceId?: string): Promise<void> {
      const tokens = await load()
      if (tokens) {
        try {
          await doFetch(`${apiUrl}/api/v1/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.accessToken}` },
            body: JSON.stringify(deviceId ? { deviceId } : {}),
          })
        } catch {
          // Offline: the local sign-out still happens; the session expires server-side.
        }
      }
      await end('user')
    },

    /** Called when the server reports the session revoked on a normal request. */
    async revoked(): Promise<void> {
      if (await load()) await end('revoked')
    },

    async isSignedIn(): Promise<boolean> {
      const tokens = await load()
      return !!tokens && Date.parse(tokens.refreshTokenExpiresAt) > now()
    },

    async claims(): Promise<Claims | null> {
      const tokens = await load()
      return tokens ? decodeClaims(tokens.accessToken) : null
    },

    subscribe(listener: (event: SessionEvent) => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export type Session = ReturnType<typeof createSession>
