import React, { useState, useEffect } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import { setToken, setRefreshToken } from '@/utils/token'
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Button, ButtonText } from '@/components/ui/button'

import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/Auth'
import { AuthFormField, AuthSubmitButton, AuthHeader } from '@/components/auth'

const verifySchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers' }),
})

type VerifyFormValues = z.infer<typeof verifySchema>

const VerifyOTPScreen = () => {
  const router = useRouter()
  const navigation = useNavigation()
  const { currentMode } = useTheme()
  const auth = useAuth()
  const params = useLocalSearchParams<{ phone: string; purpose: string }>()

  const { showAlert } = useAlert()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    defaultValues: {
      otp: '',
    },
    resolver: zodResolver(verifySchema),
  })

  useEffect(() => {
    let interval: any
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const onResend = async () => {
    if (!params.phone) return
    setCanResend(false)
    setResendTimer(30)
    try {
      const response = await axiosClient.post('/otp/send', {
        identifier: params.phone,
        identifierType: 'PHONE',
        purpose: params.purpose || 'SIGNUP',
      })
      if (!response.data.success) {
        const msg = response.data.error?.message || 'Failed to resend OTP'
        showAlert({
          title: 'Error',
          description: msg,
          type: 'error',
        })
        setCanResend(true)
        setResendTimer(0)
      } else {
        showAlert({
          title: 'Success',
          description: 'OTP resent successfully',
          type: 'success',
        })
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to resend OTP'
      showAlert({
        title: 'Error',
        description: msg,
        type: 'error',
      })
      setCanResend(true)
      setResendTimer(0)
    }
  }

  const onSubmit = async (data: VerifyFormValues) => {
    if (!params.phone) {
      showAlert({
        title: 'Error',
        description: 'Phone number is missing',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axiosClient.post('/auth/register/verify', {
        phone: params.phone,
        otp: data.otp,
      })

      if (response.data.success) {
        const { access_token, refresh_token } =
          response.data.data.insert_user_session_one
        await setToken(access_token)
        await setRefreshToken(refresh_token)

        await auth.login()

        router.replace('/(tabs)')
      } else {
        const msg = response.data.error?.message || 'Verification failed'
        showAlert({
          title: 'Verification Failed',
          description: msg,
          type: 'error',
        })
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Something went wrong during verification'
      showAlert({
        title: 'Error',
        description: msg,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="px-4 py-2">
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              router.back()
            } else {
              router.replace('/login')
            }
          }}
          className="p-2 rounded-full bg-background-50 dark:bg-background-900"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
          />
        </TouchableOpacity>
      </HStack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 24,
            }}
          >
            <VStack space="2xl" className="w-full max-w-md mx-auto">
              <AuthHeader
                title="Verify OTP"
                subtitle={`Enter the code sent to ${params.phone}`}
              />

              <VStack space="md">
                <AuthFormField
                  field={{
                    name: 'otp',
                    label: 'OTP Code',
                    placeholder: '123456',
                    icon: 'chatbubble-ellipses-outline',
                    keyboardType: 'number-pad',
                  }}
                  control={control}
                  errors={errors}
                />

                <AuthSubmitButton
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isSubmitting}
                  text="Verify"
                />

                <HStack className="justify-center items-center mt-4">
                  <Text className="text-typography-500 text-sm">
                    Didn't receive code?
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={onResend}
                    isDisabled={!canResend}
                    className="p-0 h-auto ml-1"
                  >
                    <ButtonText
                      className={`font-bold ${
                        !canResend ? 'text-typography-400' : 'text-primary-600'
                      }`}
                    >
                      Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                    </ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default VerifyOTPScreen
