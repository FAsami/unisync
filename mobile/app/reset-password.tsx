import React, { useState } from 'react'
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

const resetSchema = z.object({
  otp: z.string(),

  newPassword: z
    .string()
    .min(8, { message: 'Must be at least 8 characters' })
    .max(128, { message: 'Must not exceed 128 characters' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, {
      message: 'Must contain at least one special character',
    }),
})

type ResetFormValues = z.infer<typeof resetSchema>

const ResetPassword = () => {
  const router = useRouter()
  const navigation = useNavigation()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const { currentMode } = useTheme()
  const toast = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>({
    defaultValues: { otp: '', newPassword: '' },
    resolver: zodResolver(resetSchema),
  })

  // Redirect if no phone number (sanity check)
  React.useEffect(() => {
    if (!phone) {
      setApiError('Missing phone number. Please try again.')
    }
  }, [phone])

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'success'
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

  const onResetSubmit = async (data: ResetFormValues) => {
    if (!phone) return setIsSubmitting(false)

    setIsSubmitting(true)
    setApiError(null)
    setApiSuccess(null)
    try {
      await axiosClient.post('/auth/reset-password/verify', {
        phone: phone,
        otp: data.otp,
        newPassword: data.newPassword,
      })
      setApiSuccess('Password reset successfully! Redirecting to login...')
      showToast('Success', 'Password reset successfully', 'success')
      setTimeout(() => {
        router.replace('/login')
      }, 2000)
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset password'
      setApiError(msg)
      showToast('Error', msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) return
    setApiError(null)
    setIsSubmitting(true)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: phone,
      })
      setApiSuccess('OTP resent successfully.')
      showToast('Code Resent', 'OTP resent successfully', 'success')
    } catch (error: any) {
      setApiError('Failed to resend OTP')
      showToast('Error', 'Failed to resend OTP', 'error')
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
                  Reset Password
                </Heading>
                <Text className="text-typography-500 text-center mt-2 px-4">
                  Enter the code sent to {phone} and your new password.
                </Text>
              </VStack>

              <VStack space="lg">
                {/* OTP Field */}
                <Controller
                  control={resetControl}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!resetErrors.otp}
                      className="w-full"
                    >
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
                          value={value || ''}
                          onChangeText={(text) => onChange(text)}
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
                          {resetErrors.otp?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* New Password Field */}
                <Controller
                  control={resetControl}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!resetErrors.newPassword}
                      className="w-full"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          New Password
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                        <InputSlot className="pl-3">
                          <Icon
                            as={Ionicons}
                            name="lock-closed-outline"
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="New Password"
                          value={value || ''}
                          onChangeText={(text) => onChange(text)}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          className="text-sm"
                        />
                        <InputSlot
                          className="pr-3"
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Icon
                            as={Ionicons}
                            name={
                              showPassword ? 'eye-off-outline' : 'eye-outline'
                            }
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {resetErrors.newPassword?.message}
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
                {apiSuccess && (
                  <Box className="bg-success-50 dark:bg-success-900/20 p-3 rounded-lg border border-success-200 dark:border-success-800">
                    <Text className="text-success-600 dark:text-success-400 text-center text-sm">
                      {apiSuccess}
                    </Text>
                  </Box>
                )}

                <Button
                  onPress={handleResetSubmit(onResetSubmit)}
                  className="w-full rounded-full h-14 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-500/30"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting && (
                    <ButtonSpinner color="#fff" className="mr-2" />
                  )}
                  <ButtonText className="font-poppins-bold text-white text-base">
                    Reset Password
                  </ButtonText>
                </Button>

                <HStack className="justify-center items-center mt-4">
                  <Text className="text-typography-500 text-sm">
                    Didn't receive code?
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={handleResend}
                    className="p-0 h-auto ml-1"
                  >
                    <ButtonText className="text-primary-600 font-bold">
                      Resend
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

export default ResetPassword
