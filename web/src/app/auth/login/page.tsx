'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { PhoneInput } from '@/components/PhoneInput'
import { apiClient } from '@/lib/axios'
import { setAuthTokens } from '@/lib/cookies'
import Link from 'next/link'

const LoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm()
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
  }, [searchParams])

  const onFinish = async (values: { phone: string; password: string }) => {
    startTransition(async () => {
      try {
        setErrorMessage(null)
        form.resetFields(['password'])

        const { data } = await apiClient.post('/auth/login', values)
        if (data.success !== true) {
          throw new Error(data?.error?.message || 'Something went wrong')
        }

        // Set tokens if provided in response
        if (data.data?.access_token && data.data?.refresh_token) {
          setAuthTokens(data.data.access_token, data.data.refresh_token)
        }

        // Redirect to original destination or home
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
        router.refresh()
      } catch (error: any) {
        setErrorMessage(error?.message || 'Something went wrong!')
      }
    })
  }

  const onFinishFailed = ({ errorFields }: any) => {
    if (errorFields?.length) {
      form.scrollToField(errorFields[0].name)
    }
  }

  return (
    <>
      {errorMessage ? (
        <div
          role='status'
          aria-live='polite'
          className='bg-red-50 text-center border border-red-200 text-red-600 text-sm rounded px-4 py-3 mb-8'
        >
          {errorMessage}
        </div>
      ) : null}
      <Form
        form={form}
        name='login'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout='vertical'
        requiredMark={false}
        size='large'
        variant='underlined'
        className='[&_.ant-form-item-explain-error]:mt-2'
      >
        <Form.Item
          label='Phone'
          name='phone'
          rules={[
            { required: true, message: 'Please enter your phone number' },
            {
              pattern: /^\+8801\d{9}$/,
              message: 'Please enter a valid Bangladeshi phone number',
            },
          ]}
        >
          <PhoneInput placeholder='1XXXXXXXXX' />
        </Form.Item>

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            placeholder='Enter your password'
            prefix={<LockOutlined className='text-gray-400' />}
          />
        </Form.Item>

        <div className='text-right mb-6 -mt-2'>
          <Link
            href='/auth/forgot-password'
            className='text-blue-500 text-sm hover:underline'
          >
            Forgot password ?
          </Link>
        </div>

        <Form.Item className='mb-4'>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            shape='round'
            size='large'
            className='text-base font-medium'
          >
            LOG IN
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
export default LoginPage
