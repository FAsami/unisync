'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Alert, Button } from 'antd'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { CodeSignIn } from '@/components/CodeSignIn'
import { deleteAccount, signOut } from '@/actions/session'

type Step = 'sign-in' | 'confirm' | 'done'

/**
 * Public account deletion page (the app stores link to it). The person proves
 * the number is theirs with a texted code, confirms, and the account is
 * deleted with DELETE /me.
 */
const DeleteAccountPage = () => {
  const [step, setStep] = useState<Step>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const confirm = () =>
    startTransition(async () => {
      setError(null)
      const result = await deleteAccount()
      if (result.ok) {
        setStep('done')
        return
      }
      setError(result.message)
      if (result.code === 'UNAUTHORIZED') setStep('sign-in')
    })

  const cancel = () =>
    startTransition(async () => {
      await signOut()
      setError(null)
      setStep('sign-in')
    })

  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-[450px] p-12 bg-white'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='UniSync' />
        </div>

        <div className='flex items-center justify-center gap-3 mb-2'>
          <AlertCircle size={24} color='#B91C1C' />
          <h1 className='text-3xl font-bold text-center text-gray-900'>
            Delete account
          </h1>
        </div>
        <div className='text-center text-gray-600 text-sm mb-8'>
          {step === 'sign-in'
            ? 'First, confirm the number is yours. We’ll text you a code.'
            : 'UniSync account deletion'}
        </div>

        {error ? (
          <Alert
            type='error'
            showIcon
            message={error}
            style={{ marginBottom: 24 }}
          />
        ) : null}

        {step === 'sign-in' ? (
          <CodeSignIn
            purpose='delete-account'
            submitLabel='Continue'
            onSignedIn={() => setStep('confirm')}
          />
        ) : null}

        {step === 'confirm' ? (
          <div>
            <Alert
              type='warning'
              showIcon
              message='This deletes your UniSync account'
              description={
                <ul style={{ paddingLeft: 20, margin: 0, listStyle: 'disc' }}>
                  <li>You are signed out on every device straight away.</li>
                  <li>Your phone stops getting UniSync notifications.</li>
                  <li>
                    To use UniSync again, your department has to add you back.
                  </li>
                </ul>
              }
              style={{ marginBottom: 24 }}
            />
            <Button
              type='primary'
              danger
              block
              shape='round'
              size='large'
              loading={pending}
              onClick={confirm}
            >
              Delete my account
            </Button>
            <div className='text-center mt-3'>
              <Button type='link' disabled={pending} onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {step === 'done' ? (
          <div className='text-center'>
            <div className='flex justify-center mb-6'>
              <CheckCircle2 size={64} color='#15803D' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              Account deleted
            </h2>
            <p className='text-gray-600'>
              Your UniSync account is deleted and you have been signed out
              everywhere.
            </p>
          </div>
        ) : null}

        <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
          <p className='text-xs text-gray-500'>
            Need help? Contact your department office.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountPage
