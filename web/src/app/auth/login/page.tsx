'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CodeSignIn } from '@/components/CodeSignIn'
import { safeRedirectPath } from '@/lib/safeRedirect'

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <CodeSignIn
      purpose='dashboard'
      onSignedIn={() => {
        router.replace(
          safeRedirectPath(searchParams.get('redirect'), '/dashboard')
        )
        router.refresh()
      }}
    />
  )
}

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
)

export default LoginPage
