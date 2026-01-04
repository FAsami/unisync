import React, { useState, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import { setToken, setRefreshToken } from '@/utils/token'
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from '@/components/ui/form-control'
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { Icon } from '@/components/ui/icon'
import { useTheme } from '@/contexts/ThemeContext'

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
  const params = useLocalSearchParams<{ phone: string; purpose: string }>()
  const toast = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
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

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'error'
  ) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
          <Toast
            nativeID={id}
            action={action}
            variant="outline"
            className="mt-12 bg-white dark:bg-background-50 rounded-xl shadow-lg border-outline-100"
          >
            <VStack space="xs">
              <ToastTitle className="font-semibold text-typography-900">
                {title}
              </ToastTitle>
              <ToastDescription className="text-typography-600">
                {description}
              </ToastDescription>
            </VStack>
          </Toast>
        )
      },
    })
  }

  const onResend = async () => {
    if (!params.phone) return
    setApiError(null)
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
        setApiError(msg)
        showToast('Error', msg, 'error')
        setCanResend(true)
        setResendTimer(0)
      } else {
        showToast('Code Resent', 'A new OTP has been sent', 'success')
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to resend OTP'
      setApiError(msg)
      showToast('Error', msg, 'error')
      setCanResend(true)
      setResendTimer(0)
    }
  }

  const onSubmit = async (data: VerifyFormValues) => {
    if (!params.phone) {
      setApiError('Phone number is missing')
      return
    }

    setIsSubmitting(true)
    setApiError(null)
    try {
      const response = await axiosClient.post('/auth/register/verify', {
        phone: params.phone,
        otp: data.otp,
      })

      console.log('Verify Response', response.data)

      if (response.data.success) {
        const { access_token, refresh_token } =
          response.data.data.insert_user_session_one
        await setToken(access_token)
        await setRefreshToken(refresh_token)

        showToast('Success', 'Verification successful', 'success')

        // Navigate to tabs/home and reset stack
        router.replace('/(tabs)')
      } else {
        const msg = response.data.error?.message || 'Verification failed'
        setApiError(msg)
        showToast('Verification Failed', msg, 'error')
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Something went wrong during verification'
      setApiError(msg)
      showToast('Error', msg, 'error')
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
              <VStack className="items-center mb-8">
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 100, height: 100, marginBottom: 20 }}
                  resizeMode="contain"
                />
                <Heading
                  size="xl"
                  className="font-bold text-typography-900 text-center"
                >
                  Verify OTP
                </Heading>
                <Text className="text-typography-500 text-center mt-2 px-4">
                  Enter the code sent to {params.phone}
                </Text>
              </VStack>

              <VStack space="lg">
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.otp} className="w-full">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          OTP Code
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                        <InputSlot className="pl-3">
                          <Icon
                            as={Ionicons}
                            name="chatbubble-ellipses-outline"
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="123456"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="number-pad"
                          maxLength={6}
                          className="text-lg tracking-[5px] font-medium"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {errors.otp?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {apiError && (
                  <Box className="bg-error-50 dark:bg-error-900/20 p-3 rounded-lg border border-error-200 dark:border-error-800">
                    <Text className="text-error-600 dark:text-error-400 text-center text-sm">
                      {apiError}
                    </Text>
                  </Box>
                )}

                <Button
                  onPress={handleSubmit(onSubmit)}
                  className="w-full rounded-full h-14 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-500/30"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting && (
                    <ButtonSpinner color="#fff" className="mr-2" />
                  )}
                  <ButtonText className="font-poppins-bold text-white text-base">
                    Verify
                  </ButtonText>
                </Button>

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
