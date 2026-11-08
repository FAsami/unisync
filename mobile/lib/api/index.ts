import { getEnv } from '@/utils/getEnv'
import { createApi } from './client'
import { secureStorage } from './secureStorage'
import { createSession } from './session'

const apiUrl: string = getEnv('API_URL') ?? ''

/** The app-wide session and typed API client. */
export const session = createSession({ storage: secureStorage, apiUrl })
export const api = createApi(apiUrl, session)

export { ApiError, call, unwrap, unwrapWithMessage } from './errors'
export type { Tokens, SessionEvent } from './session'
