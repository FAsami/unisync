import { ApiError, call, toApiError, unwrap } from '../errors'

const response = (status: number) => ({ ok: status < 400, status }) as Response

it('unwraps the payload of a successful envelope', () => {
  expect(unwrap({ data: { success: true, data: { phone: '+8801712345678' } }, response: response(200) })).toEqual({ phone: '+8801712345678' })
})

it("throws the server's code and message on failure", () => {
  const body = { success: false, error: { code: 'PHONE_NOT_REGISTERED', message: "This number isn't on your department's list yet." } }
  expect(() => unwrap({ error: body, response: response(404) })).toThrow(
    expect.objectContaining({ code: 'PHONE_NOT_REGISTERED', status: 404, message: "This number isn't on your department's list yet." })
  )
})

it('exposes per-field messages from VALIDATION_FAILED', () => {
  const error = toApiError(400, { error: { code: 'VALIDATION_FAILED', message: 'Some fields need fixing.', details: { firstName: 'Enter your first name.', n: 1 } } })
  expect(error.fieldErrors).toEqual({ firstName: 'Enter your first name.' })
})

it('turns a dropped connection into a NETWORK error', async () => {
  await expect(call(() => Promise.reject(new TypeError('Network request failed')))).rejects.toMatchObject({ code: 'NETWORK' })
  await expect(call(() => Promise.reject(new ApiError('x', 'INVALID_CODE', 400)))).rejects.toMatchObject({ code: 'INVALID_CODE' })
})
