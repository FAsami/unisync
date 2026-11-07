import createClient from 'openapi-fetch'
import type { paths } from './generated'
import type { Session } from './session'

/**
 * Typed client for the .NET API, generated from api/openapi/v1.json.
 * Adds the bearer token, and on TOKEN_EXPIRED refreshes once and retries.
 * A SESSION_REVOKED answer signs the user out everywhere in the app.
 */
export const createApi = (apiUrl: string, session: Session, baseFetch: typeof fetch = globalThis.fetch.bind(globalThis)) => {
  const send = async (request: Request, token: string | null) => {
    const attempt = request.clone()
    if (token) attempt.headers.set('Authorization', `Bearer ${token}`)
    return baseFetch(attempt)
  }

  const authedFetch = async (request: Request): Promise<Response> => {
    const response = await send(request, await session.getAccessToken())
    if (response.status !== 401) return response

    const code = await response
      .clone()
      .json()
      .then((b) => b?.error?.code as string | undefined)
      .catch(() => undefined)

    if (code === 'TOKEN_EXPIRED') {
      const token = await session.refreshAccessToken()
      if (token) return send(request, token)
    } else if (code === 'SESSION_REVOKED') {
      await session.revoked()
    }
    return response
  }

  return createClient<paths>({ baseUrl: apiUrl, fetch: authedFetch })
}

export type Api = ReturnType<typeof createApi>
