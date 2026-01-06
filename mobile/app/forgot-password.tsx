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
import { useRouter, useNavigation } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import { Ionicons } from '@expo/vector-icons'

import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'

import { useTheme } from '@/contexts/ThemeContext'
import { AuthFormField, AuthSubmitButton, AuthHeader } from '@/components/auth'

const requestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: 'Please enter your phone number' })
    .regex(/^\+8801\d{9}$/, {
      message: 'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
    }),
})

type RequestFormValues = z.infer<typeof requestSchema>

const ForgotPassword = () => {
  const router = useRouter()
  const navigation = useNavigation()
  const { currentMode } = useTheme()
  const { showAlert } = useAlert()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<RequestFormValues>({
    defaultValues: { phoneNumber: '+880' },
    resolver: zodResolver(requestSchema),
  })

  const onRequestSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: data.phoneNumber,
      })

      router.push({
        pathname: '/reset-password',
        params: { phone: data.phoneNumber },
      })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || 'Failed to send OTP'
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
                title="Forgot Password?"
                subtitle="Enter your phone number to receive a reset code."
              />

              <VStack space="md">
                <AuthFormField
                  field={{
                    name: 'phoneNumber',
                    label: 'Phone Number',
                    placeholder: '+8801...',
                    icon: 'call-outline',
                    keyboardType: 'phone-pad',
                  }}
                  control={requestControl}
                  errors={requestErrors}
                />

                <AuthSubmitButton
                  onPress={handleRequestSubmit(onRequestSubmit)}
                  isLoading={isSubmitting}
                  text="Send Code"
                />
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ForgotPassword
