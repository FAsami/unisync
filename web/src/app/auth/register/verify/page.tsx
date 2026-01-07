import { redirect } from 'next/navigation'
import { VerifyContext } from '@/lib/verifyContext'
import RegisterVerifyForm from './RegisterVerifyForm'
import { decrypt } from '@/lib/encrypt'

type Props = {
  searchParams: Promise<{ ctx?: string }>
}

export default async function RegisterVerifyPage({ searchParams }: Props) {
  const params = await searchParams
  const ctx = params.ctx
  let context: VerifyContext | null = null
  if (ctx) {
    const result = decrypt(decodeURIComponent(ctx))
    if (result) {
      context = JSON.parse(result) as VerifyContext
    }
  }
  if (!context) {
    redirect('/auth/register')
  }
  const channel = context.identifierType === 'EMAIL' ? 'email' : 'phone'

  return (
    <>
      <h1 className='text-3xl font-bold text-center text-gray-900 mb-2'>
        Verify your account
      </h1>
      <div className='text-center text-gray-600 text-sm mb-8'>
        We&apos;ve sent an OTP to your{' '}
        <span className='font-medium text-gray-900'>{context.identifier}</span>{' '}
        {channel}. Please verify to complete your registration.
      </div>
      <RegisterVerifyForm context={context} />
    </>
  )
}
