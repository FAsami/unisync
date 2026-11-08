'use server'

import {
  clearTokens,
  readTokens,
  serverApi,
  storeTokens,
} from '@/lib/session/server'

/**
 * Sign-in, sign-out and account deletion. These run on the server so the
 * tokens the API returns go straight into httpOnly cookies.
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string }

type ApiResult = {
  data?: {
    success: boolean
    data?: unknown
    error?: { code: string; message: string } | null
  }
  error?: unknown
  response: Response
}

const failure = (
  result: ApiResult | null,
  fallback: string
): { ok: false; message: string; code?: string } => {
  const body = (result?.error ?? result?.data) as ApiResult['data']
  return {
    ok: false,
    message: body?.error?.message ?? fallback,
    code: body?.error?.code,
  }
}

const UNREACHABLE = 'Could not reach UniSync. Try again in a moment.'

export const requestCode = async (
  phone: string
): Promise<ActionResult<{ phone: string; expiresInSeconds: number }>> => {
  try {
    const result = await (
      await serverApi()
    ).POST('/api/v1/auth/code', {
      body: { phone },
    })
    if (result.response.ok && result.data?.success && result.data.data) {
      const { phone: normalised, expiresInSeconds } = result.data.data
      return {
        ok: true,
        data: { phone: normalised, expiresInSeconds: Number(expiresInSeconds) },
      }
    }
    return failure(result, 'Could not send a code. Try again.')
  } catch {
    return { ok: false, message: UNREACHABLE }
  }
}

export type SignInPurpose = 'dashboard' | 'delete-account'

const NOT_FOR_WEB =
  'UniSync on the web is for department admins. Students and teachers: please use the UniSync mobile app.'
const NO_DEPARTMENT =
  "Your admin account isn't linked to a department yet. Ask whoever set up UniSync to link it."

/**
 * Checks the code and stores the session. For the dashboard only department
 * admins are let in: anyone else is signed straight back out with a message.
 */
export const verifyCode = async (
  phone: string,
  code: string,
  purpose: SignInPurpose
): Promise<ActionResult<{ role: string }>> => {
  try {
    const result = await (
      await serverApi()
    ).POST('/api/v1/auth/verify', {
      body: { phone, code },
    })
    const tokens = result.data?.data
    if (!result.response.ok || !result.data?.success || !tokens) {
      return failure(result, 'That code did not work. Try again.')
    }

    if (purpose === 'dashboard') {
      const signedIn = await serverApi(tokens.accessToken)
      const refusal =
        tokens.role !== 'admin'
          ? NOT_FOR_WEB
          : (await signedIn.GET('/api/v1/department')).response.status === 403
            ? NO_DEPARTMENT
            : null
      if (refusal) {
        await signedIn.POST('/api/v1/auth/logout', { body: null })
        return { ok: false, message: refusal, code: 'NOT_A_DEPARTMENT_ADMIN' }
      }
    }

    await storeTokens(tokens)
    return { ok: true, data: { role: tokens.role } }
  } catch {
    return { ok: false, message: UNREACHABLE }
  }
}

/** Ends the session on the API (best effort) and clears the cookies. */
export const signOut = async (): Promise<void> => {
  const { accessToken, refreshToken } = await readTokens()
  try {
    let result = accessToken
      ? await (
          await serverApi(accessToken)
        ).POST('/api/v1/auth/logout', { body: null })
      : null
    // An expired access token can't log out: refresh once so the session is
    // really revoked on the API, not just forgotten by this browser.
    if ((!result || result.response.status === 401) && refreshToken) {
      const refreshed = await (
        await serverApi()
      ).POST('/api/v1/auth/refresh', {
        body: { refreshToken },
      })
      const fresh = refreshed.data?.data?.accessToken
      if (fresh)
        result = await (
          await serverApi(fresh)
        ).POST('/api/v1/auth/logout', { body: null })
    }
  } catch {
    // The cookies are cleared either way.
  }
  await clearTokens()
}

/**
 * Deletes the signed-in account (DELETE /me): the API revokes every session and
 * device. Refreshes once if the access token has lapsed.
 */
export const deleteAccount = async (): Promise<
  ActionResult<{ deletedAt: string }>
> => {
  try {
    let { accessToken } = await readTokens()
    const { refreshToken } = await readTokens()
    let result = await (await serverApi(accessToken)).DELETE('/api/v1/me')
    if (result.response.status === 401 && refreshToken) {
      const refreshed = await (
        await serverApi()
      ).POST('/api/v1/auth/refresh', {
        body: { refreshToken },
      })
      const tokens = refreshed.data?.data
      // The old refresh token is spent: keep the new pair, or the next refresh
      // would replay the old one and end the session.
      if (tokens) await storeTokens(tokens)
      accessToken = tokens?.accessToken
      if (accessToken)
        result = await (await serverApi(accessToken)).DELETE('/api/v1/me')
    }
    if (result.response.ok && result.data?.success && result.data.data) {
      await clearTokens()
      return { ok: true, data: { deletedAt: result.data.data.deletedAt } }
    }
    if (result.response.status === 401) {
      await clearTokens()
      return {
        ok: false,
        message: 'Your sign-in has expired. Start again.',
        code: 'UNAUTHORIZED',
      }
    }
    return failure(result, 'Could not delete the account. Try again.')
  } catch {
    return { ok: false, message: UNREACHABLE }
  }
}
