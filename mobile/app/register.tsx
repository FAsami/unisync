import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  GET_DEPARTMENTS_FOR_REGISTRATION,
  GET_BATCHES_FOR_REGISTRATION,
  GET_SECTIONS_FOR_REGISTRATION,
} from '@/lib/graphql-operations'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'

import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Button, ButtonText } from '@/components/ui/button'

import {
  AuthFieldRenderer,
  AuthSubmitButton,
  AuthHeader,
  type AuthFieldConfig,
} from '@/components/auth'

const registerSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    studentId: z.string().min(1, { message: 'Student ID is required' }),
    departmentId: z.string().min(1, { message: 'Department is required' }),
    batchId: z.string().min(1, { message: 'Batch is required' }),
    sectionId: z.string().min(1, { message: 'Section is required' }),
    phoneNumber: z
      .string()
      .min(1, { message: 'Please enter your phone number' })
      .regex(/^\+8801\d{9}$/, {
        message:
          'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
      }),
    email: z
      .email({ message: 'Please enter a valid email' })
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, { message: 'Must be at least 8 characters' })
      .max(128, { message: 'Must not exceed 128 characters' })
      .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, {
        message: 'Must contain at least one special character',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

import { useAlert } from '@/contexts/AlertContext'

const Register = () => {
  const router = useRouter()
  const { showAlert } = useAlert()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      studentId: '',
      departmentId: '',
      batchId: '',
      sectionId: '',
      phoneNumber: '+880',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  })

  const fields: AuthFieldConfig<RegisterFormValues>[] = [
    {
      type: 'input',
      name: 'firstName' as const,
      label: 'First Name',
      placeholder: 'First Name',
      icon: 'person-outline',
      keyboardType: 'default',
    },
    {
      type: 'input',
      name: 'lastName' as const,
      label: 'Last Name',
      placeholder: 'Last Name',
      icon: 'person-outline',
      keyboardType: 'default',
    },
    {
      type: 'input',
      name: 'studentId' as const,
      label: 'Student ID',
      placeholder: 'e.g. 211000000',
      icon: 'card-outline',
      keyboardType: 'default',
    },
    {
      type: 'input',
      name: 'phoneNumber' as const,
      label: 'Phone Number',
      placeholder: '+8801...',
      icon: 'call-outline',
      keyboardType: 'phone-pad',
    },
    {
      type: 'input',
      name: 'email' as const,
      label: 'Email (Optional)',
      placeholder: 'Enter your email',
      icon: 'mail-outline',
      keyboardType: 'email-address',
    },
    {
      type: 'input',
      name: 'password' as const,
      label: 'Password',
      placeholder: 'Create password',
      icon: 'lock-closed-outline',
      isPassword: true,
    },
    {
      type: 'input',
      name: 'confirmPassword' as const,
      label: 'Confirm Password',
      placeholder: 'Re-enter password',
      icon: 'lock-closed-outline',
      isPassword: true,
    },
    {
      type: 'select',
      name: 'departmentId' as const,
      label: 'Department',
      placeholder: 'Select Department',
      icon: 'business-outline',
      getValue: (departments) => {
        const deptId = watch('departmentId')
        if (!deptId) return 'Select Department'
        const dept = departments.find((d: any) => d.id === deptId)
        return dept?.name || 'Select Department'
      },
      modalTitle: 'Select Department',
      query: {
        query: GET_DEPARTMENTS_FOR_REGISTRATION,
        dataPath: 'academic_department',
      },
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => (
        <Text
          className={`text-base ${
            isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
          }`}
        >
          {item.name} ({item.code})
        </Text>
      ),
      selectedItem: watch('departmentId')
        ? { id: watch('departmentId') }
        : undefined,
    },
    {
      type: 'select',
      name: 'batchId' as const,
      label: 'Batch',
      placeholder: 'Select Batch',
      icon: 'people-outline',
      disabled: !watch('departmentId'),
      getValue: (batches) => {
        const batchId = watch('batchId')
        if (!batchId) return 'Select Batch'
        const batch = batches.find((b: any) => b.id === batchId)
        return batch?.name || 'Select Batch'
      },
      modalTitle: 'Select Batch',
      query: {
        query: GET_BATCHES_FOR_REGISTRATION,
        variables: { departmentId: watch('departmentId') },
        skip: !watch('departmentId'),
        dataPath: 'academic_batch',
      },
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => (
        <Text
          className={`text-base ${
            isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
          }`}
        >
          {item.name}
        </Text>
      ),
      selectedItem: watch('batchId') ? { id: watch('batchId') } : undefined,
      onValidationError: () => null,
    },
    {
      type: 'select',
      name: 'sectionId' as const,
      label: 'Section',
      placeholder: 'Select Section',
      icon: 'grid-outline',
      disabled: !watch('batchId'),
      getValue: (sections) => {
        const sectionId = watch('sectionId')
        if (!sectionId) return 'Select Section'
        const section = sections.find((s: any) => s.id === sectionId)
        return section?.name || 'Select Section'
      },
      modalTitle: 'Select Section',
      query: {
        query: GET_SECTIONS_FOR_REGISTRATION,
        variables: { batchId: watch('batchId') },
        skip: !watch('batchId'),
        dataPath: 'academic_section',
      },
      keyExtractor: (item: any) => item.id || '',
      renderItem: (item: any, isSelected: boolean) => (
        <Text
          className={`text-base ${
            isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
          }`}
        >
          {item.name}
        </Text>
      ),
      selectedItem: watch('sectionId') ? { id: watch('sectionId') } : undefined,
      onValidationError: () => null,
    },
  ]

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    try {
      const registerResponse = await axiosClient.post('/auth/register', {
        phone: data.phoneNumber,
        password: data.password,
        email: data.email || undefined,
        role: 'student',
        first_name: data.firstName,
        last_name: data.lastName,
        student_id: data.studentId,
        department_id: data.departmentId,
        batch_id: data.batchId,
        section_id: data.sectionId,
      })

      if (registerResponse.data.success) {
        try {
          await axiosClient.post('/otp/send', {
            identifier: data.phoneNumber,
            identifierType: 'PHONE',
            purpose: 'SIGNUP',
          })

          router.push({
            pathname: '/verify-otp',
            params: { phone: data.phoneNumber, purpose: 'SIGNUP' },
          })
        } catch (otpError: any) {
          const msg =
            otpError?.response?.data?.message ||
            otpError?.message ||
            'Failed to send OTP'

          showAlert({
            title: 'OTP Error',
            description: msg,
            type: 'error',
          })
        }
      } else {
        const msg = registerResponse.data.error.message || 'Registration failed'
        showAlert({
          title: 'Registration Failed',
          description: msg,
          type: 'error',
        })
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Something went wrong'

      showAlert({
        title: 'Registration Failed',
        description: msg,
        type: 'error',
      })
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
        <Box className="px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="flex-row items-center self-start -ml-2"
          >
            <Ionicons name="chevron-back" size={20} color="#0077e6" />
            <Text className="ml-1 text-primary-600 font-bold">Login</Text>
          </TouchableOpacity>
        </Box>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
          >
            <VStack space="2xl" className="w-full max-w-md mx-auto">
              <AuthHeader
                title="Create Account"
                subtitle="Get started with unisync"
              />

              <VStack space="lg">
                <AuthFieldRenderer
                  fields={fields}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                />
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Fixed Footer - Submit Button */}
        <Box className="px-6 pb-6 pt-4 bg-white dark:bg-background-950 border-t border-outline-200">
          <VStack space="md" className="w-full max-w-md mx-auto">
            <AuthSubmitButton
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              text="Create Student Account"
            />
            <HStack className="justify-center items-center space-x-1">
              <Text className="text-typography-500">
                Already have an account?
              </Text>
              <Button
                variant="link"
                size="sm"
                onPress={() => router.push('/login')}
                className="h-auto p-0"
              >
                <ButtonText className="text-primary-600 font-bold">
                  Login
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Register
