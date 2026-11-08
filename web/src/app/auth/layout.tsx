import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-[450px] p-12 bg-white'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='Unisync' />
        </div>
        <h1 className='text-3xl font-bold text-center text-gray-900 mb-2'>
          Sign in
        </h1>
        <p className='text-center text-gray-600 text-sm'>
          For department admins. We&apos;ll text you a code; there is no
          password.
        </p>
        <div className='mt-8'>{children}</div>
        <p className='mt-8 text-center text-gray-500 text-sm'>
          Students and teachers use the UniSync mobile app.
        </p>
      </div>
    </div>
  )
}
