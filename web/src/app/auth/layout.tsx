'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const authPageConfig: Record<
  string,
  {
    title?: string
    subtitle?: ReactNode
    footer?: ReactNode
  }
> = {
  '/auth/login': {
    title: 'Welcome back',
    footer: (
      <p className='text-center text-gray-600 text-sm'>
        Don't have an account?{' '}
        <Link
          href='/auth/register'
          className='text-blue-500 font-medium hover:underline'
        >
          Register
        </Link>
      </p>
    ),
  },
  '/auth/register': {
    title: 'Create your account',
    footer: (
      <p className='text-center text-gray-600 text-sm'>
        Already have an account?{' '}
        <Link
          href='/auth/login'
          className='text-blue-500 font-medium hover:underline'
        >
          Login
        </Link>
      </p>
    ),
  },
  '/auth/forgot-password': {
    title: 'Forgot password',
    subtitle: 'Enter your phone number to receive reset instructions.',
    footer: (
      <p className='text-center text-gray-600 text-sm'>
        Remembered it?{' '}
        <Link
          href='/auth/login'
          className='text-blue-500 font-medium hover:underline'
        >
          Back to login
        </Link>
      </p>
    ),
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const config = authPageConfig[pathname] || {}
  const { title, subtitle, footer } = config
  const hasHeaderContent = Boolean(title || subtitle)

  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-[450px] p-12 bg-white'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='Unisync' />
        </div>

        {title ? (
          <h1 className='text-3xl font-bold text-center text-gray-900 mb-2'>
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <div className='text-center text-gray-600 text-sm'>{subtitle}</div>
        ) : null}

        <div className={hasHeaderContent ? 'mt-8' : ''}>{children}</div>

        {footer ? <div className='mt-8'>{footer}</div> : null}
      </div>
    </div>
  )
}
