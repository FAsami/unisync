/**
 * Bangladeshi mobile numbers, the same rules the API applies
 * (api/src/UniSync.Api/Auth/PhoneNumber.cs). Lets the form validate instantly
 * and shows the user the number we will text.
 */

/** Digits the user types after the fixed "+880" prefix: 1XXXXXXXXX. */
export const LOCAL_LENGTH = 10

/** Accepts 01712345678, 1712345678, +8801712345678, 8801712345678, with spaces or dashes. */
export const normalizePhone = (input: string): string | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  const hasPlus = trimmed.startsWith('+')
  const body = hasPlus ? trimmed.slice(1) : trimmed
  if (/[^\d\s-]/.test(body)) return null

  let digits = body.replace(/[\s-]/g, '')
  if (digits.startsWith('880')) digits = digits.slice(3)
  else if (hasPlus) return null
  else if (digits.startsWith('0')) digits = digits.slice(1)

  if (!/^1[3-9]\d{8}$/.test(digits)) return null
  return `+880${digits}`
}

/** "+8801712345678" → "+880 1712-345678" for display. */
export const formatPhone = (e164: string): string =>
  /^\+8801\d{9}$/.test(e164) ? `+880 ${e164.slice(4, 8)}-${e164.slice(8)}` : e164
