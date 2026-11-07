import { createSession, type SessionEvent } from '../session'
import { json, memoryStorage, tokens } from './helpers'

const API = 'https://api.test'

const setup = async (accessExpiresInMs: number, fetchImpl: jest.Mock) => {
  const storage = memoryStorage()
  const session = createSession({ storage, apiUrl: API, fetch: fetchImpl as unknown as typeof fetch })
  const events: SessionEvent[] = []
  session.subscribe((e) => events.push(e))
  await session.signIn(tokens(accessExpiresInMs))
  events.length = 0
  return { storage, session, events }
}

it('uses the stored token while it is fresh, without calling the server', async () => {
  const fetchImpl = jest.fn()
  const { session } = await setup(10 * 60_000, fetchImpl)
  expect(await session.getAccessToken()).toMatch(/\.a$/)
  expect(fetchImpl).not.toHaveBeenCalled()
})

it('refreshes an expiring token once, however many callers ask at the same time', async () => {
  const fetchImpl = jest.fn(async () => json(200, { success: true, data: tokens(3_600_000, Date.now(), 'b') }))
  const { session } = await setup(10_000, fetchImpl) // expires within the early-refresh window

  const results = await Promise.all([session.getAccessToken(), session.getAccessToken(), session.getAccessToken()])

  expect(fetchImpl).toHaveBeenCalledTimes(1)
  expect(new Set(results)).toEqual(new Set([expect.stringMatching(/\.b$/)]))
  const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe(`${API}/api/v1/auth/refresh`)
  expect(JSON.parse(init.body as string)).toEqual({ refreshToken: 'refresh-a' })
})

it('ends the session when the server says it was revoked', async () => {
  const fetchImpl = jest.fn(async () => json(401, { success: false, error: { code: 'SESSION_REVOKED', message: 'Signed out' } }))
  const { session, storage, events } = await setup(10_000, fetchImpl)

  expect(await session.getAccessToken()).toBeNull()
  expect(events).toEqual([{ type: 'signed-out', reason: 'revoked' }])
  expect(storage.data.size).toBe(0)
  expect(await session.isSignedIn()).toBe(false)
})

it('keeps the session when offline instead of signing the user out', async () => {
  const fetchImpl = jest.fn(async () => {
    throw new TypeError('Network request failed')
  })
  const { session, events } = await setup(10_000, fetchImpl)

  await session.getAccessToken()
  expect(events).toEqual([])
  expect(await session.isSignedIn()).toBe(true)
})

it('signs out with the device id, and still signs out locally when offline', async () => {
  const fetchImpl = jest.fn(async () => json(200, { success: true, data: null }))
  const { session, events } = await setup(3_600_000, fetchImpl)

  await session.signOut('install-1')
  const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe(`${API}/api/v1/auth/logout`)
  expect(JSON.parse(init.body as string)).toEqual({ deviceId: 'install-1' })
  expect((init.headers as Record<string, string>).Authorization).toMatch(/^Bearer /)
  expect(events).toEqual([{ type: 'signed-out', reason: 'user' }])

  const offline = jest.fn(async () => {
    throw new TypeError('offline')
  })
  const second = await setup(3_600_000, offline)
  await second.session.signOut()
  expect(await second.session.isSignedIn()).toBe(false)
})

it('reads the user id and role from the access token', async () => {
  const { session } = await setup(3_600_000, jest.fn())
  expect(await session.claims()).toEqual({ userId: 'u1', role: 'student', sessionId: 's1' })
})
