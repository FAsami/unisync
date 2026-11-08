'use client'

import { useState, useTransition } from 'react'
import { Alert, Button, Form, Input } from 'antd'
import { PhoneInput } from '@/components/PhoneInput'
import { requestCode, verifyCode, type SignInPurpose } from '@/actions/session'

interface CodeSignInProps {
  purpose: SignInPurpose
  submitLabel?: string
  onSignedIn: (role: string) => void
}

/**
 * Passwordless sign-in: phone number, then the 6-digit code texted to it.
 * The code is checked by a server action, which keeps the tokens in httpOnly
 * cookies.
 */
export const CodeSignIn = ({
  purpose,
  submitLabel = 'Sign in',
  onSignedIn,
}: CodeSignInProps) => {
  const [phone, setPhone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [codeForm] = Form.useForm<{ code: string }>()

  const send = (value: string) =>
    startTransition(async () => {
      setError(null)
      setNotice(null)
      const result = await requestCode(value)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setPhone(result.data.phone)
      setNotice(`We texted a code to ${result.data.phone}.`)
      codeForm.resetFields()
    })

  const verify = (code: string) =>
    startTransition(async () => {
      if (!phone) return
      setError(null)
      const result = await verifyCode(phone, code, purpose)
      if (!result.ok) {
        setError(result.message)
        if (result.code === 'NOT_A_DEPARTMENT_ADMIN') {
          // The code is used up and this number can't sign in here.
          setPhone(null)
          setNotice(null)
        } else {
          codeForm.setFieldsValue({ code: '' })
        }
        return
      }
      onSignedIn(result.data.role)
    })

  return (
    <div>
      {error ? (
        <Alert
          type='error'
          showIcon
          message={error}
          style={{ marginBottom: 24 }}
          role='alert'
        />
      ) : notice ? (
        <Alert
          type='info'
          showIcon
          message={notice}
          style={{ marginBottom: 24 }}
        />
      ) : null}

      {phone === null ? (
        <Form
          name='phone'
          layout='vertical'
          requiredMark={false}
          size='large'
          variant='underlined'
          onFinish={(values: { phone: string }) => send(values.phone)}
        >
          <Form.Item
            label='Mobile number'
            name='phone'
            rules={[
              { required: true, message: 'Enter your mobile number' },
              {
                pattern: /^\+8801\d{9}$/,
                message: 'Enter a Bangladeshi mobile number, like 1712345678',
              },
            ]}
          >
            <PhoneInput autoFocus />
          </Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            shape='round'
            size='large'
            loading={pending}
          >
            Send code
          </Button>
        </Form>
      ) : (
        <Form
          form={codeForm}
          name='code'
          layout='vertical'
          requiredMark={false}
          size='large'
          initialValues={{ code: '' }}
          onFinish={(values) => verify(values.code)}
        >
          <Form.Item
            label='6-digit code'
            name='code'
            rules={[
              { required: true, message: 'Enter the code from the SMS' },
              { len: 6, message: 'The code has 6 digits' },
            ]}
          >
            <Input.OTP
              length={6}
              autoFocus
              onChange={(value) => {
                if (value.length === 6) verify(value)
              }}
            />
          </Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            shape='round'
            size='large'
            loading={pending}
          >
            {submitLabel}
          </Button>
          <div className='flex justify-between mt-4 text-sm'>
            <Button
              type='link'
              className='p-0'
              onClick={() => {
                setPhone(null)
                setError(null)
                setNotice(null)
              }}
            >
              Use a different number
            </Button>
            <Button
              type='link'
              className='p-0'
              disabled={pending}
              onClick={() => send(phone)}
            >
              Send a new code
            </Button>
          </div>
        </Form>
      )}
    </div>
  )
}
