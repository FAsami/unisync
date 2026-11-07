import type { TokenStorage, Tokens } from '../session'

export const memoryStorage = (): TokenStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  }
}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')

/** A JWT-shaped token (unsigned: the app never verifies, only reads claims). */
export const jwt = (claims: object) => `${b64({ alg: 'HS256' })}.${b64(claims)}.sig`

export const tokens = (accessExpiresInMs: number, now = Date.now(), tag = 'a'): Tokens => ({
  sessionId: 's1',
  accessToken: `${jwt({ sessionId: 's1', userId: 'u1', role: 'student' })}.${tag}`,
  accessTokenExpiresAt: new Date(now + accessExpiresInMs).toISOString(),
  refreshToken: `refresh-${tag}`,
  refreshTokenExpiresAt: new Date(now + 30 * 86_400_000).toISOString(),
  role: 'student',
})

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
