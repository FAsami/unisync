import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-[var(--color-surface)]'>
      <div className='w-full max-w-[450px] p-12 bg-[var(--color-surface-raised)] border border-[var(--color-line)] rounded-xl'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='Unisync' />
        </div>
        <h1 className='text-3xl font-bold text-center text-[var(--color-ink)] mb-2'>
          Sign in
        </h1>
        <p className='text-center text-[var(--color-ink-muted)] text-sm'>
          For department admins. We&apos;ll text you a code; there is no
          password.
        </p>
        <div className='mt-8'>{children}</div>
        <p className='mt-8 text-center text-[var(--color-ink-faint)] text-sm'>
          Students and teachers use the UniSync mobile app.
        </p>
      </div>
    </div>
  )
}
