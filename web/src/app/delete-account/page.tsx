'use client'

import { useState, useTransition, Suspense } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { PhoneInput } from '@/components/PhoneInput'
import { apiClient } from '@/lib/axios'
import Image from 'next/image'

const DeleteAccountForm = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('success')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [phoneForm] = Form.useForm()
  const [otpForm] = Form.useForm()

  const onPhoneFinish = async (values: { phone: string }) => {
    startTransition(async () => {
      try {
        setErrorMessage(null)

        const response = await apiClient.post('/otp/send', {
          identifier: values.phone,
          identifierType: 'PHONE',
          purpose: 'DELETE_ACCOUNT',
        })

        if (response.status >= 400 || !response.data?.success) {
          throw new Error(response.data?.message || 'Failed to send OTP')
        }

        setPhoneNumber(values.phone)
        setStep('otp')
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to send OTP')
      }
    })
  }

  const onOtpFinish = async (values: { otp: string }) => {
    startTransition(async () => {
      try {
        setErrorMessage(null)

        const response = await apiClient.post('/auth/account/delete', {
          phone: phoneNumber,
          otp: values.otp,
        })

        if (response.status >= 400 || !response.data?.success) {
          throw new Error(response.data?.message || 'Failed to delete account')
        }

        setStep('success')
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to delete account')
      }
    })
  }

  const handleChangePhone = () => {
    setStep('phone')
    phoneForm.resetFields()
    otpForm.resetFields()
    setErrorMessage(null)
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-[450px] p-12 bg-white'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='UniSync' />
        </div>

        <div className='flex items-center justify-center gap-3 mb-2'>
          <ExclamationCircleOutlined
            style={{ fontSize: '24px', color: '#dc2626' }}
          />
          <h1 className='text-3xl font-bold text-center text-gray-900'>
            Delete Account
          </h1>
        </div>

        <div className='text-center text-gray-600 text-sm mb-8'>
          UniSync Account Deletion
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type='error'
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            className='mb-6'
          />
        )}

        {step === 'phone' && (
          <Form
            form={phoneForm}
            name='phone'
            onFinish={onPhoneFinish}
            layout='vertical'
            requiredMark={false}
            size='large'
            variant='underlined'
            className='[&_.ant-form-item-explain-error]:mt-2'
          >
            <Form.Item
              label='Phone Number'
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

            <Form.Item className='mb-4'>
              <Button
                type='primary'
                danger
                htmlType='submit'
                block
                loading={isPending}
                shape='round'
                size='large'
                className='text-base font-medium'
              >
                SEND OTP
              </Button>
            </Form.Item>
          </Form>
        )}

        {step === 'otp' && (
          <Form
            form={otpForm}
            name='otp'
            onFinish={onOtpFinish}
            layout='vertical'
            requiredMark={false}
            size='large'
            variant='underlined'
            className='[&_.ant-form-item-explain-error]:mt-2'
          >
            <Alert
              message='Important Information'
              description={
                <ul style={{ paddingLeft: 20, margin: 0, listStyle: 'disc' }}>
                  <li>Your account will be deactivated immediately</li>
                  <li>
                    You have 30 days to restore your account by logging in
                  </li>
                  <li>
                    After 30 days, all your data will be permanently deleted
                  </li>
                  <li>This action cannot be undone after the 30-day period</li>
                </ul>
              }
              type='warning'
              showIcon
              className='mb-6'
            />

            <Form.Item
              label='Enter OTP'
              name='otp'
              rules={[
                { required: true, message: 'Please enter the OTP' },
                {
                  pattern: /^\d{6}$/,
                  message: 'OTP must be exactly 6 digits',
                },
              ]}
            >
              <Input
                placeholder='6-digit code'
                maxLength={6}
                style={{
                  textAlign: 'center',
                  fontSize: 24,
                  letterSpacing: 8,
                }}
              />
            </Form.Item>

            <div className='text-center text-gray-600 text-sm mb-6 -mt-2'>
              OTP sent to {phoneNumber}
            </div>

            <Form.Item className='mb-4'>
              <Button
                type='primary'
                danger
                htmlType='submit'
                block
                loading={isPending}
                shape='round'
                size='large'
                className='text-base font-medium'
              >
                DELETE MY ACCOUNT
              </Button>
            </Form.Item>

            <div className='text-center'>
              <Button type='link' onClick={handleChangePhone}>
                Change Phone Number
              </Button>
            </div>
          </Form>
        )}

        {step === 'success' && (
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              <div className='flex justify-center mb-6'>
                <CheckCircleOutlined
                  style={{ fontSize: 64, color: '#52c41a' }}
                />
              </div>
              Account Scheduled for Deletion
            </h2>
            <p className='text-gray-600 mb-6'>
              Your account has been deactivated. You have 30 days to restore it
              by logging in.
            </p>
            <Alert
              message={
                <span>
                  <strong>To restore your account:</strong> Simply log in to the
                  UniSync app within the next 30 days. After 30 days, your
                  account and all associated data will be permanently deleted.
                </span>
              }
              type='info'
            />
          </div>
        )}

        <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
          <p className='text-xs text-gray-500'>Need help? Contact support</p>
        </div>
      </div>
    </div>
  )
}

const DeleteAccountPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeleteAccountForm />
    </Suspense>
  )
}

export default DeleteAccountPage
