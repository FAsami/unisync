/** An API failure, carrying the envelope's error (its message is written for people). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** Field-level messages from a VALIDATION_FAILED response, if any. */
  get fieldErrors(): Record<string, string> {
    const d = this.details
    if (!d || typeof d !== 'object' || Array.isArray(d)) return {}
    return Object.fromEntries(
      Object.entries(d).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    )
  }
}

type Envelope<T> = {
  success: boolean
  message?: string | null
  data?: T
  error?: { code: string; message: string; details?: unknown } | null
}

/**
 * Reads an openapi-fetch result: returns `data` from a successful envelope and
 * throws an ApiError (with the server's message) for anything else. A
 * successful envelope's data is non-null, except for endpoints that return
 * nothing (callers ignore those).
 */
export const unwrap = async <T>(
  pending: Promise<{
    data?: Envelope<T>
    error?: unknown
    response: Response
  }>
): Promise<NonNullable<T>> => {
  let result: Awaited<typeof pending>
  try {
    result = await pending
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'Could not reach UniSync. Check your connection and try again.'
    )
  }
  const { data, error, response } = result
  if (response.ok && data?.success) return data.data as NonNullable<T>
  const body = (error ?? data) as Envelope<unknown> | undefined
  throw new ApiError(
    response.status,
    body?.error?.code ?? 'UNKNOWN',
    body?.error?.message ?? 'Something went wrong. Please try again.',
    body?.error?.details
  )
}

/** The message to show for any thrown value. */
export const messageOf = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : 'Something went wrong. Please try again.'
