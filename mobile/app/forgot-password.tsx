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
import { useRouter, useNavigation } from 'expo-router'
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
  const toast = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<RequestFormValues>({
    defaultValues: { phoneNumber: '+880' },
    resolver: zodResolver(requestSchema),
  })

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

  const onRequestSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: data.phoneNumber,
      })

      showToast('Code Sent', 'OTP sent to your phone number', 'success')
      router.push({
        pathname: '/reset-password',
        params: { phone: data.phoneNumber },
      })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || 'Failed to send OTP'
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
                  Forgot Password?
                </Heading>
                <Text className="text-typography-500 text-center mt-2 px-4">
                  Enter your phone number to receive a reset code.
                </Text>
              </VStack>

              <VStack space="lg">
                <Controller
                  control={requestControl}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!requestErrors.phoneNumber}
                      className="w-full"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Phone Number
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                        <InputSlot className="pl-3">
                          <Icon
                            as={Ionicons}
                            name="call-outline"
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="+8801..."
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {requestErrors.phoneNumber?.message}
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
                  onPress={handleRequestSubmit(onRequestSubmit)}
                  className="w-full rounded-full h-14 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-500/30"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting && (
                    <ButtonSpinner color="#fff" className="mr-2" />
                  )}
                  <ButtonText className="font-poppins-bold text-white text-base">
                    Send Code
                  </ButtonText>
                </Button>
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ForgotPassword
