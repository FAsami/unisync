import React, { useState, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native'
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Button, ButtonText } from '@/components/ui/button'

import { useAuth } from '@/contexts/Auth'
import { useAlert } from '@/contexts/AlertContext'
import {
  AuthFormField,
  AuthSubmitButton,
  AuthHeader,
  type AuthFormFieldConfig,
} from '@/components/auth'

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .max(14, { message: 'Please enter a valid Bangladeshi phone number' })
    .min(14, { message: 'Please enter a valid Bangladeshi phone number' })
    .refine((value) => value.startsWith('+880'), {
      message: 'Phone number must start with +880',
    })
    .refine(
      (value) => {
        const operatorDigit = value.charAt(5)
        return ['3', '4', '5', '6', '7', '8', '9'].includes(operatorDigit)
      },
      {
        message: 'Please enter a valid Bangladeshi phone number',
      }
    ),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const router = useRouter()
  const auth = useAuth()
  const { showAlert } = useAlert()

  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const formFields: AuthFormFieldConfig<LoginFormValues>[] = [
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      placeholder: '+8801',
      icon: 'call-outline',
      keyboardType: 'phone-pad',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      icon: 'lock-closed-outline',
      isPassword: true,
    },
  ]

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await axiosClient.post('/auth/login', {
        phone: data.phoneNumber,
        password: data.password,
      })

      if (response.data?.data?.access_token) {
        await AsyncStorage.setItem(
          'iam_access_token',
          response.data.data.access_token
        )
        await AsyncStorage.setItem(
          'iam_refresh_token',
          response.data.data.refresh_token
        )
        await auth.login()
        router.replace('/(tabs)')
      } else {
        showAlert({
          title: 'Login Failed',
          description:
            response?.data?.error?.message ||
            'Something went wrong. Please try again.',
          type: 'error',
        })
      }
    } catch (error: any) {
      let msg = 'Something went wrong. Please try again.'
      if (error.response?.data?.error?.code === 'INVALID_CREDENTIALS') {
        msg = error.response.data.error.message
      }
      showAlert({
        title: 'Login Failed',
        description: msg,
        type: 'error',
      })
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
              padding: 32,
            }}
          >
            <VStack space="2xl" className="w-full max-w-md mx-auto">
              <AuthHeader
                title="Account Login"
                subtitle="Sign in to continue to unisync"
              />

              <VStack space="md">
                {formFields.map((field) => (
                  <AuthFormField
                    key={field.name}
                    field={field}
                    control={control}
                    errors={errors}
                  />
                ))}

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

                <AuthSubmitButton
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isSubmitting}
                  text="Login"
                />

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
