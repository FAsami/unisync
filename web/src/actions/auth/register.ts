'use server'
import { redirect } from 'next/navigation'
import { apiClient } from '@/lib/axios'
import { encrypt } from '@/lib/encrypt'

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
      await apiClient.post('/otp/send', {
        identifier: phone,
        identifierType: 'PHONE',
        purpose: 'SIGNUP',
      })
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
      message:
        response.data.message ||
        response.data?.error?.message ||
        'Something went wrong!',
    }
  }
}

export { registerAction }
