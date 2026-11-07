import { createApi } from '../client'
import { createSession } from '../session'
import { json, memoryStorage, tokens } from './helpers'

const API = 'https://api.test'

const setup = async (handler: (request: Request) => Promise<Response>) => {
  const sessionFetch = jest.fn(async () => json(200, { success: true, data: tokens(3_600_000, Date.now(), 'fresh') }))
  const session = createSession({ storage: memoryStorage(), apiUrl: API, fetch: sessionFetch as unknown as typeof fetch })
  await session.signIn(tokens(3_600_000))
  const seen: Request[] = []
  const api = createApi(API, session, (async (request: Request) => {
    seen.push(request)
    return handler(request)
  }) as typeof fetch)
  return { api, session, seen, sessionFetch }
}

it('sends the bearer token', async () => {
  const { api, seen } = await setup(async () => json(200, { success: true, data: { status: 'ok', version: '1' } }))
  const result = await api.GET('/api/v1/health')
  expect(result.data?.data?.status).toBe('ok')
  expect(seen[0].headers.get('Authorization')).toMatch(/^Bearer .+\.a$/)
})

it('refreshes once and retries when the token expired, with the request body intact', async () => {
  let calls = 0
  const { api, seen, sessionFetch } = await setup(async () =>
    ++calls === 1
      ? json(401, { success: false, error: { code: 'TOKEN_EXPIRED', message: 'expired' } })
      : json(200, { success: true, data: { phone: '+8801712345678', expiresInSeconds: 300 } })
  )

  const result = await api.POST('/api/v1/auth/code', { body: { phone: '01712345678' } })

  expect(result.response.status).toBe(200)
  expect(sessionFetch).toHaveBeenCalledTimes(1)
  expect(seen).toHaveLength(2)
  expect(seen[1].headers.get('Authorization')).toMatch(/\.fresh$/)
  expect(await seen[1].json()).toEqual({ phone: '01712345678' })
})

it('signs the user out when the server reports the session revoked', async () => {
  const { api, session } = await setup(async () => json(401, { success: false, error: { code: 'SESSION_REVOKED', message: 'revoked' } }))
  const events: string[] = []
  session.subscribe((e) => events.push(e.type === 'signed-out' ? e.reason : e.type))

  const result = await api.GET('/api/v1/me')

  expect(result.response.status).toBe(401)
  expect(events).toEqual(['revoked'])
  expect(await session.isSignedIn()).toBe(false)
})
