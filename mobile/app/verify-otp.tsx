import React, { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { AuthHeader, AuthSubmitButton } from '@/components/auth'
import { CodeField, Notice } from '@/components/signin/Fields'
import { SignInScreen } from '@/components/signin/SignInScreen'
import { useAuth } from '@/contexts/Auth'
import { api, ApiError, call, unwrap } from '@/lib/api'
import { formatPhone } from '@/lib/phone'

const CODE_LENGTH = 6
const RESEND_SECONDS = 30

/** Sign-in step 2: the code from the SMS. Fills itself from the SMS where the OS allows. */
export default function VerifyCode() {
  const router = useRouter()
  const auth = useAuth()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [code, setCode] = useState('')
  const [problem, setProblem] = useState<ApiError>()
  const [info, setInfo] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [wait, setWait] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH || verifying) return
    setProblem(undefined)
    setVerifying(true)
    try {
      const tokens = await call(async () => unwrap(await api.POST('/api/v1/auth/verify', { body: { phone, code: value } })))
      await auth.login(tokens)
      router.replace('/(tabs)')
    } catch (error) {
      setProblem(error as ApiError)
      setCode('')
    } finally {
      setVerifying(false)
    }
  }

  const resend = async () => {
    setProblem(undefined)
    setInfo(undefined)
    try {
      await call(async () => unwrap(await api.POST('/api/v1/auth/code', { body: { phone } })))
      setInfo('A new code is on its way.')
      setWait(RESEND_SECONDS)
    } catch (error) {
      setProblem(error as ApiError)
    }
  }

  const remaining = (problem?.details as { attemptsRemaining?: number } | undefined)?.attemptsRemaining

  return (
    <SignInScreen>
      <VStack className="flex-1 justify-center" space="lg">
        <AuthHeader title="Enter your code" subtitle={`We texted a ${CODE_LENGTH}-digit code to ${formatPhone(phone ?? '')}.`} />

        <CodeField value={code} onChange={setCode} length={CODE_LENGTH} onComplete={verify} />

        {problem ? (
          <Notice
            message={remaining !== undefined && remaining > 0 ? `${problem.message} ${remaining} tries left.` : problem.message}
          />
        ) : info ? (
          <Notice tone="success" message={info} />
        ) : null}

        <AuthSubmitButton onPress={() => verify()} isLoading={verifying} text="Sign in" disabled={code.length !== CODE_LENGTH} />

        <Pressable
          onPress={resend}
          disabled={wait > 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: wait > 0 }}
          className="min-h-[44px] items-center justify-center"
        >
          <Text className={wait > 0 ? 'text-typography-400' : 'text-primary-600 font-semibold'}>
            {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace({ pathname: '/login', params: { phone } })}
          accessibilityRole="button"
          className="min-h-[44px] items-center justify-center"
        >
          <Text className="text-primary-600">Use a different number</Text>
        </Pressable>
      </VStack>
    </SignInScreen>
  )
}
