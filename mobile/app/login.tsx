import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'react-native'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input'
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

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(14, { message: 'Please enter a valid phone number' })
    .refine((value) => value.startsWith('+880'), {
      message: 'Phone number must start with +880',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const router = useRouter()
  const { currentMode } = useTheme()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      phoneNumber: '+880',
      password: '',
    },
    resolver: zodResolver(loginSchema),
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

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null)
    setIsSubmitting(true)
    try {
      const response = await axiosClient.post('/auth/login', {
        phone: data.phoneNumber,
        password: data.password,
      })
      console.log('==> response', response.data)

      if (response.data?.data?.access_token) {
        await AsyncStorage.setItem(
          'iam_access_token',
          response.data.data.access_token
        )
        await AsyncStorage.setItem(
          'iam_refresh_token',
          response.data.data.refresh_token
        )
        router.replace('/(tabs)')
      } else {
        const msg =
          response?.data?.error?.message ||
          'Something went wrong. Please try again.'
        setApiError(msg)
        showToast('Login Failed', msg, 'error')
      }
    } catch (error: any) {
      let msg = 'Something went wrong. Please try again.'
      if (error.response?.data?.error?.code === 'INVALID_CREDENTIALS') {
        msg = error.response.data.error.message
      }
      setApiError(msg)
      showToast('Login Failed', msg, 'error')
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
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
                  style={{ width: 100, height: 100, marginBottom: 16 }}
                  resizeMode="contain"
                />
                <Heading
                  size="xl"
                  className="font-bold text-typography-900 text-center"
                >
                  Welcome Back
                </Heading>
                <Text className="text-typography-500 text-center mt-2">
                  Sign in to continue to UniSync
                </Text>
              </VStack>

              <VStack space="lg">
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!errors.phoneNumber}
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
                          onChangeText={(text) => {
                            onChange(text)
                            if (apiError) setApiError(null)
                          }}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                          className="text-lg"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {errors.phoneNumber?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!errors.password}
                      className="w-full"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Password
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
                          placeholder="Enter your password"
                          value={value}
                          onChangeText={(text) => {
                            onChange(text)
                            if (apiError) setApiError(null)
                          }}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          className="text-lg"
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
                          {errors.password?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                <Box className="items-end">
                  <Button
                    variant="link"
                    size="sm"
                    onPress={() => router.replace('/forgot-password')}
                    className="p-0 h-auto"
                  >
                    <ButtonText className="text-primary-600 font-medium">
                      Forgot Password?
                    </ButtonText>
                  </Button>
                </Box>

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
                  <ButtonText className="font-poppins-bold text-white text-lg">
                    Login
                  </ButtonText>
                </Button>

                <HStack className="justify-center items-center mt-4 space-x-1">
                  <Text className="text-typography-500">
                    Don't have an account?
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    onPress={() => router.navigate('/register')}
                    className="h-auto p-0"
                  >
                    <ButtonText className="text-primary-600 font-bold">
                      Register
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

export default Login
