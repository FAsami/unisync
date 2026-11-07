/**
 * End-to-end check of the app's real client + session code against a running
 * API (Development mode, console SMS). Skipped unless UNISYNC_LIVE_API is set.
 *
 *   UNISYNC_LIVE_API=http://localhost:9202   API origin
 *   UNISYNC_LIVE_SMS_LOG=/path/api.log        where the API writes "[dev SMS]" lines
 *   UNISYNC_LIVE_PHONE=+8801XXXXXXXXX         a rostered student with a class today
 *   UNISYNC_LIVE_COURSE=CSE101                that class's course code
 */
import { readFileSync } from 'fs'
import { createApi } from '../client'
import { unwrap } from '../errors'
import { createSession } from '../session'
import { memoryStorage } from './helpers'

const API = process.env.UNISYNC_LIVE_API
const run = API ? describe : describe.skip

const codeFor = async (phone: string, kind: 'sign-in' | 'verification'): Promise<string> => {
  for (let i = 0; i < 50; i++) {
    const log = readFileSync(process.env.UNISYNC_LIVE_SMS_LOG!, 'utf8')
    const matches = [...log.matchAll(new RegExp(`to \\${phone}: (\\d{6}) is your UniSync ${kind} code`, 'g'))]
    if (matches.length) return matches[matches.length - 1][1]
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`No ${kind} code for ${phone} in the API log`)
}

run('live API', () => {
  const phone = process.env.UNISYNC_LIVE_PHONE!
  const session = createSession({ storage: memoryStorage(), apiUrl: API! })
  const api = createApi(API!, session)

  it('signs in with a local-format number, reads my day, refreshes and signs out', async () => {
    const local = '0' + phone.slice(4)
    const sent = unwrap(await api.POST('/api/v1/auth/code', { body: { phone: local } }))
    expect(sent.phone).toBe(phone)

    const tokens = unwrap(await api.POST('/api/v1/auth/verify', { body: { phone: local, code: await codeFor(phone, 'sign-in') } }))
    await session.signIn(tokens)
    expect(await session.isSignedIn()).toBe(true)

    const me = unwrap(await api.GET('/api/v1/me'))
    expect(me.phone).toBe(phone)
    expect((await session.claims())?.userId).toBe(me.id)

    const today = unwrap(await api.GET('/api/v1/me/today'))
    expect(today.scope).toBe('section')
    expect(today.classes.map((c) => c.course?.code)).toContain(process.env.UNISYNC_LIVE_COURSE)

    const before = await session.getAccessToken()
    const after = await session.refreshAccessToken()
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
    expect(unwrap(await api.GET('/api/v1/me')).id).toBe(me.id)

    await session.signOut('live-install')
    const signedOut = await api.GET('/api/v1/me')
    expect(signedOut.response.status).toBe(401)
  })

  it('offers request access to an unknown number and submits a request', async () => {
    const stranger = '+8801' + String(Math.floor(3e8 + Math.random() * 6.99e8)).padStart(9, '0')
    const refused = await api.POST('/api/v1/auth/code', { body: { phone: stranger } })
    expect(refused.error?.error?.code).toBe('PHONE_NOT_REGISTERED')

    const directory = unwrap(await api.GET('/api/v1/directory'))
    const section = directory.flatMap((d) => d.batches.flatMap((b) => b.sections))[0]
    expect(section).toBeDefined()

    unwrap(await api.POST('/api/v1/access-requests/code', { body: { phone: stranger } }))
    const created = unwrap(
      await api.POST('/api/v1/access-requests', {
        body: { phone: stranger, code: await codeFor(stranger, 'verification'), firstName: 'Live', lastName: 'Check', studentId: `LIVE-${Date.now()}`, sectionId: section.id },
      })
    )
    expect(created.status).toBe('pending')
  })
})
