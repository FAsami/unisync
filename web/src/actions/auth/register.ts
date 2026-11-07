'use server'
import { redirect } from 'next/navigation'
import { apiClient } from '@/lib/axios'
import { encrypt } from '@/lib/encrypt'
import { getApiErrorMessage } from '@/lib/apiError'

const registerAction = async ({
  phone,
  password,
  email,
}: {
  phone: string
  password: string
  email?: string
}) => {
  const response = await apiClient.post('/auth/register', {
    phone,
    password,
    email,
  })
  if (response.data.success) {
    try {
      // apiClient never throws on HTTP errors (validateStatus: () => true), so
      // the status must be checked or a failed/rate-limited send is ignored.
      const otpResponse = await apiClient.post('/otp/send', {
        identifier: phone,
        identifierType: 'PHONE',
        purpose: 'SIGNUP',
      })
      if (otpResponse.status >= 400) {
        return {
          success: false,
          message: getApiErrorMessage(otpResponse.data, 'Failed to send OTP'),
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to send OTP',
      }
    }

    const context = {
      flow: 'register',
      identifier: phone,
      identifierType: 'PHONE',
      purpose: 'SIGNUP',
      redirectTo: '/',
    }
    const encrypted = encrypt(JSON.stringify(context))
    redirect(`/auth/register/verify?ctx=${encodeURIComponent(encrypted)}`)
  } else {
    return {
      success: false,
      message: getApiErrorMessage(response.data, 'Something went wrong!'),
    }
  }
}

export { registerAction }
