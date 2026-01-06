import React, { useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Button, ButtonText } from '@/components/ui/button'

import { useTheme } from '@/contexts/ThemeContext'
import { AuthFormField, AuthSubmitButton, AuthHeader } from '@/components/auth'

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
  const { showAlert } = useAlert()

  const [isSubmitting, setIsSubmitting] = useState(false)

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
      showAlert({
        title: 'Error',
        description: 'Missing phone number. Please try again.',
        type: 'error',
      })
    }
  }, [phone])

  const onResetSubmit = async (data: ResetFormValues) => {
    if (!phone) return setIsSubmitting(false)

    setIsSubmitting(true)
    try {
      await axiosClient.post('/auth/reset-password/verify', {
        phone: phone,
        otp: data.otp,
        newPassword: data.newPassword,
      })
      showAlert({
        title: 'Success',
        description: 'Password reset successfully! Redirecting to login...',
        type: 'success',
        onConfirm: () => {
          router.replace('/login')
        },
      })
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset password'
      showAlert({
        title: 'Error',
        description: msg,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) return
    setIsSubmitting(true)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: phone,
      })
      showAlert({
        title: 'Success',
        description: 'OTP resent successfully.',
        type: 'success',
      })
    } catch (error: any) {
      showAlert({
        title: 'Error',
        description: 'Failed to resend OTP',
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
                title="Reset Password"
                subtitle={`Enter the code sent to ${phone} and your new password.`}
              />

              <VStack space="md">
                {/* OTP Field */}
                <AuthFormField
                  field={{
                    name: 'otp',
                    label: 'OTP Code',
                    placeholder: '123456',
                    icon: 'chatbubble-ellipses-outline',
                    keyboardType: 'number-pad',
                  }}
                  control={resetControl}
                  errors={resetErrors}
                />

                {/* New Password Field */}
                <AuthFormField
                  field={{
                    name: 'newPassword',
                    label: 'New Password',
                    placeholder: 'New Password',
                    icon: 'lock-closed-outline',
                    isPassword: true,
                  }}
                  control={resetControl}
                  errors={resetErrors}
                />

                <AuthSubmitButton
                  onPress={handleResetSubmit(onResetSubmit)}
                  isLoading={isSubmitting}
                  text="Reset Password"
                />

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
