'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button } from 'antd'
import { KeyOutlined, LockOutlined } from '@ant-design/icons'
import { apiClient } from '@/lib/axios'
import {
  clearVerifyContext,
  saveVerifyContext,
  VerifyContext,
} from '@/lib/verifyContext'
import { resendOtpAction } from '@/actions/auth/resendOtp'

type VerifyFormValues = {
  otp: string
  password: string
  confirmPassword: string
}

const passwordRules = [
  { required: true, message: 'Please enter your new password' },
  { min: 8, message: 'Must be at least 8 characters' },
  { max: 128, message: 'Must not exceed 128 characters' },
  {
    pattern: /[A-Z]/,
    message: 'Must contain at least one uppercase letter',
  },
  {
    pattern: /[a-z]/,
    message: 'Must contain at least one lowercase letter',
  },
  {
    pattern: /[0-9]/,
    message: 'Must contain at least one number',
  },
  {
    pattern: /[^A-Za-z0-9]/,
    message: 'Must contain at least one special character',
  },
]

type Props = {
  context: VerifyContext
}

export default function ForgotPasswordVerifyForm({
  context: initialContext,
}: Props) {
  const router = useRouter()
  const savedRef = useRef(false)

  if (!savedRef.current) {
    saveVerifyContext(initialContext)
    savedRef.current = true
  }

  const [context, setContext] = useState<VerifyContext>(initialContext)
  const [form] = Form.useForm<VerifyFormValues>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const sendOtp = useCallback(async () => {
    if (!context) {
      setErrorMessage('Verification session not found')
      return
    }

    try {
      setIsSendingOtp(true)
      setErrorMessage(null)

      const { success, message } = await resendOtpAction({
        identifier: context.identifier,
        identifierType: context.identifierType,
        purpose: context.purpose,
      })

      if (!success) {
        setErrorMessage(message || 'Failed to send OTP')
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to send OTP')
    } finally {
      setIsSendingOtp(false)
    }
  }, [context])

  const onFinish = (values: VerifyFormValues) => {
    startTransition(async () => {
      try {
        if (!context?.identifier) {
          throw new Error('Verification session not found')
        }

        setErrorMessage(null)
        form.setFields([
          { name: 'otp', errors: [] },
          { name: 'password', errors: [] },
          { name: 'confirmPassword', errors: [] },
        ])

        const identifierKey =
          context.identifierType === 'EMAIL' ? 'email' : 'phone'

        let identifier = context.identifier.trim()

        if (context.identifierType === 'EMAIL') {
          identifier = identifier.toLowerCase()
        } else if (context.identifierType === 'PHONE') {
          identifier = identifier.replace(/\s+/g, '')
          if (!identifier.startsWith('+')) {
            if (identifier.startsWith('880')) {
              identifier = `+${identifier}`
            } else if (identifier.startsWith('0')) {
              identifier = `+880${identifier.slice(1)}`
            } else if (/^1\d{9}$/.test(identifier)) {
              identifier = `+880${identifier}`
            }
          }
        }

        const response = await apiClient.post('/auth/reset-password/verify', {
          [identifierKey]: identifier,
          otp: values.otp,
          newPassword: values.password,
        })

        const { status, data } = response
        const payload =
          data && typeof data === 'object' && 'success' in data
            ? data
            : status < 400
              ? { success: true, data }
              : {
                  success: false,
                  message:
                    (data as { message?: string })?.message ||
                    'Verification failed',
                }

        if (!payload.success) {
          throw new Error(
            (payload as { message?: string }).message || 'Verification failed'
          )
        }

        clearVerifyContext()
        setContext(null as any)
        router.push(context.redirectTo || '/auth/login')
      } catch (error: any) {
        const message = error?.message || 'Verification failed'
        setErrorMessage(message)

        form.setFields([
          { name: 'otp', errors: [message] },
          { name: 'password', errors: [message] },
          { name: 'confirmPassword', errors: [message] },
        ])
      }
    })
  }

  const onFinishFailed = ({ errorFields }: any) => {
    if (errorFields?.length) {
      form.scrollToField(errorFields[0].name)
    }
  }

  const footerContent = (
    <p className='text-sm text-gray-600 text-center'>
      Didn't receive the code?{' '}
      <button
        type='button'
        onClick={() => void sendOtp()}
        disabled={!context || isSendingOtp}
        className='text-blue-500 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline'
      >
        {isSendingOtp ? 'Sending...' : 'Resend code'}
      </button>
    </p>
  )
  return (
    <>
      {errorMessage ? (
        <div
          role='status'
          aria-live='polite'
          className='bg-red-50 border border-red-200 text-red-600 text-sm rounded px-4 py-3 mb-8'
        >
          {errorMessage}
        </div>
      ) : null}
      <Form
        form={form}
        name='verify'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout='vertical'
        requiredMark={false}
        size='large'
        variant='underlined'
        className='[&_.ant-form-item-explain-error]:mt-2'
      >
        <Form.Item
          label='Verification Code'
          name='otp'
          rules={[
            { required: true, message: 'Please enter the verification code' },
            {
              pattern: /^\d{4,6}$/,
              message: 'Please enter a valid OTP (4-6 digits)',
            },
          ]}
        >
          <Input
            placeholder='Enter verification code'
            prefix={<KeyOutlined className='text-gray-400' />}
            maxLength={6}
          />
        </Form.Item>

        <Form.Item label='New Password' name='password' rules={passwordRules}>
          <Input.Password
            placeholder='Enter new password'
            prefix={<LockOutlined className='text-gray-400' />}
          />
        </Form.Item>
        <Form.Item
          label='Confirm Password'
          name='confirmPassword'
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password
            placeholder='Confirm new password'
            prefix={<LockOutlined className='text-gray-400' />}
          />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            shape='round'
            size='large'
            className='text-base font-medium'
            disabled={!context}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
      {footerContent}
    </>
  )
}
