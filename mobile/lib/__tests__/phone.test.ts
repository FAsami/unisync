import { formatPhone, normalizePhone } from '../phone'

describe('normalizePhone (same rules as the API)', () => {
  it.each(['01712345678', '1712345678', '+8801712345678', '8801712345678', ' 017-1234-5678 ', '1712 345678'])(
    'accepts %s',
    (input) => expect(normalizePhone(input)).toBe('+8801712345678')
  )

  it.each(['', 'abc', '0171234567', '017123456789', '01212345678', '+14155552671', '01712345678x'])('rejects %s', (input) => {
    expect(normalizePhone(input)).toBeNull()
  })
})

it('formats a number for display', () => {
  expect(formatPhone('+8801712345678')).toBe('+880 1712-345678')
})
