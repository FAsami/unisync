/** Codes the API returns in error.code (api/src/UniSync.Api/Common/ApiResponse.cs), plus client-side ones. */
export type ApiErrorCode =
  | 'NETWORK'
  | 'UNKNOWN'
  | 'INVALID_PHONE'
  | 'PHONE_NOT_REGISTERED'
  | 'TOO_MANY_CODES'
  | 'SMS_FAILED'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'TOO_MANY_ATTEMPTS'
  | 'ALREADY_REGISTERED'
  | 'REQUEST_PENDING'
  | 'STUDENT_ID_TAKEN'
  | 'INVALID_SECTION'
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'SESSION_REVOKED'
  | 'RATE_LIMITED'
  | (string & {})

/** A failed API call, carrying the server's own message (written for students). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: ApiErrorCode,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** Per-field messages from VALIDATION_FAILED, e.g. { firstName: "Enter your first name." }. */
  get fieldErrors(): Record<string, string> {
    return this.details && typeof this.details === 'object' && !Array.isArray(this.details)
      ? Object.fromEntries(Object.entries(this.details).filter(([, v]) => typeof v === 'string')) as Record<string, string>
      : {}
  }
}

type Envelope<T> = { success?: boolean; message?: string | null; data?: T | null; error?: { code?: string; message?: string; details?: unknown } | null }

/** Reads the API envelope from any response body. */
export const toApiError = (status: number, body: unknown): ApiError => {
  const envelope = (body ?? {}) as Envelope<unknown>
  const error = envelope.error
  return new ApiError(
    error?.message || 'Something went wrong. Please try again.',
    error?.code || (status === 0 ? 'NETWORK' : 'UNKNOWN'),
    status,
    error?.details
  )
}

/**
 * Turns an openapi-fetch result into the payload, or throws ApiError.
 * Every call site checks the outcome this way, never by assuming success.
 */
export const unwrap = <T>(result: { data?: Envelope<T>; error?: unknown; response: Response }): T => {
  if (result.response.ok && result.data?.success) {
    return result.data.data as T
  }
  throw toApiError(result.response.status, result.error ?? result.data)
}

/**
 * Like unwrap, and also returns the envelope's message: the confirmation the
 * server wrote for people ("Class cancelled. The section has been notified.").
 */
export const unwrapWithMessage = <T>(result: { data?: Envelope<T>; error?: unknown; response: Response }): { data: T; message: string } => ({
  data: unwrap(result),
  message: result.data?.message ?? '',
})

/** Wraps a call so a dropped connection becomes ApiError('NETWORK') instead of a bare TypeError. */
export const call = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError("Can't reach UniSync. Check your connection and try again.", 'NETWORK', 0)
  }
}
