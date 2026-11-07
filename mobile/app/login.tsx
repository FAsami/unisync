import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { VStack } from '@/components/ui/vstack'
import { AuthHeader, AuthSubmitButton } from '@/components/auth'
import { Notice, PhoneField } from '@/components/signin/Fields'
import { SignInScreen } from '@/components/signin/SignInScreen'
import { api, ApiError, call, unwrap } from '@/lib/api'
import { normalizePhone } from '@/lib/phone'

/**
 * Sign-in step 1: the number the department registered. No passwords
 * (UX review decision 1). Numbers not on the roster are offered "Request access".
 */
export default function Login() {
  const router = useRouter()
  const params = useLocalSearchParams<{ phone?: string }>()
  const [local, setLocal] = useState(params.phone?.replace(/^\+880/, '') ?? '')
  const [fieldError, setFieldError] = useState<string>()
  const [problem, setProblem] = useState<ApiError>()
  const [sending, setSending] = useState(false)

  const submit = async () => {
    setProblem(undefined)
    const phone = normalizePhone(local)
    if (!phone) {
      setFieldError('Enter your number, like 1712 345678.')
      return
    }
    setFieldError(undefined)
    setSending(true)
    try {
      await call(async () =>
        unwrap(await api.POST('/api/v1/auth/code', { body: { phone } })),
      )
      router.push({ pathname: '/verify-otp', params: { phone } })
    } catch (error) {
      setProblem(error as ApiError)
    } finally {
      setSending(false)
    }
  }

  const phone = normalizePhone(local) ?? undefined

  return (
    <SignInScreen>
      <VStack className="flex-1 justify-center" space="lg">
        <AuthHeader
          title="Sign in"
          subtitle="Enter the mobile number your department registered. We'll text you a code."
        />

        <PhoneField
          value={local}
          onChange={setLocal}
          error={fieldError}
          onSubmit={submit}
        />

        {problem?.code === 'PHONE_NOT_REGISTERED' ? (
          <Notice
            tone="info"
            message={`${problem.message} You can ask your department to add you.`}
            action={{
              label: 'Request access',
              onPress: () =>
                router.push({ pathname: '/request-access', params: { phone } }),
            }}
          />
        ) : problem ? (
          <Notice message={problem.message} />
        ) : null}

        <AuthSubmitButton
          onPress={submit}
          isLoading={sending}
          text="Send code"
        />

        {problem?.code === 'PHONE_NOT_REGISTERED' ? null : (
          <Notice
            tone="info"
            message="New here and not on your department's list?"
            action={{
              label: 'Request access',
              onPress: () =>
                router.push({ pathname: '/request-access', params: { phone } }),
            }}
          />
        )}
      </VStack>
    </SignInScreen>
  )
}
