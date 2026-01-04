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
import { useRouter } from 'expo-router'
import {
  GET_DEPARTMENTS_FOR_REGISTRATION,
  GET_BATCHES_FOR_REGISTRATION,
  GET_SECTIONS_FOR_REGISTRATION,
} from '@/lib/graphql-operations'
import { SelectModal } from '@/components/ui/SelectModal'
import { useQuery } from '@apollo/client'
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
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelperText,
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

const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  studentId: z.string().min(1, { message: 'Student ID is required' }),
  departmentId: z.string().optional(),
  batchId: z.string().optional(),
  sectionId: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, { message: 'Please enter your phone number' })
    .regex(/^\+8801\d{9}$/, {
      message: 'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
    }),
  email: z
    .string()
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
})

type RegisterFormValues = z.infer<typeof registerSchema>

const Register = () => {
  const router = useRouter()
  const { currentMode } = useTheme()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)

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
    },
    resolver: zodResolver(registerSchema),
  })

  const watchedDeptId = watch('departmentId')
  const watchedBatchId = watch('batchId')

  const {
    data: deptData,
    loading: deptLoading,
    error: deptError,
  } = useQuery(GET_DEPARTMENTS_FOR_REGISTRATION)

  const {
    data: batchData,
    loading: batchLoading,
    error: batchError,
  } = useQuery(GET_BATCHES_FOR_REGISTRATION, {
    variables: { departmentId: watchedDeptId },
    skip: !watchedDeptId,
  })
  const {
    data: sectionData,
    loading: sectionLoading,
    error: sectionError,
  } = useQuery(GET_SECTIONS_FOR_REGISTRATION, {
    variables: { batchId: watchedBatchId },
    skip: !watchedBatchId,
  })

  const departments = deptData?.academic_department || []
  const batches = batchData?.academic_batch || []
  const sections = sectionData?.academic_section || []

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

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      const registerResponse = await axiosClient.post('/auth/register', {
        phone: data.phoneNumber,
        password: data.password,
        email: data.email || undefined,
        role: 'student',
        first_name: data.firstName,
        last_name: data.lastName,
        student_id: data.studentId,
        department_id: data.departmentId || undefined,
        batch_id: data.batchId || undefined,
        section_id: data.sectionId || undefined,
      })

      if (registerResponse.data.success) {
        try {
          await axiosClient.post('/otp/send', {
            identifier: data.phoneNumber,
            identifierType: 'PHONE',
            purpose: 'SIGNUP',
          })

          console.log('Registration successful, OTP sent')
          showToast('Account Created', 'OTP sent to your phone', 'success')

          router.push({
            pathname: '/verify-otp',
            params: { phone: data.phoneNumber, purpose: 'SIGNUP' },
          })
        } catch (otpError: any) {
          const msg =
            otpError?.response?.data?.message ||
            otpError?.message ||
            'Failed to send OTP'
          setApiError(msg)
          showToast('Error', msg, 'error')
        }
      } else {
        const msg = registerResponse.data.error.message || 'Registration failed'
        setApiError(msg)
        showToast('Error', msg, 'error')
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Something went wrong'
      setApiError(msg)
      showToast('Error', msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDeptName = () => {
    if (!watchedDeptId) return 'Select Department'
    return (
      departments.find((d: any) => d.id === watchedDeptId)?.name ||
      'Select Department'
    )
  }

  const getBatchName = () => {
    if (!watchedBatchId) return 'Select Batch'
    return (
      batches.find((b: any) => b.id === watchedBatchId)?.name || 'Select Batch'
    )
  }

  const getSectionName = () => {
    const watchedSectionId = watch('sectionId')
    if (!watchedSectionId) return 'Select Section'
    return (
      sections.find((s: any) => s.id === watchedSectionId)?.name ||
      'Select Section'
    )
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
              <VStack className="items-center mb-4">
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={{ width: 100, height: 100, marginBottom: 16 }}
                  resizeMode="contain"
                />
                <Heading
                  size="xl"
                  className="font-bold text-typography-900 text-center"
                >
                  Create Account
                </Heading>
                <Text className="text-typography-500 text-center mt-2">
                  Get started with UniSync
                </Text>
              </VStack>

              <VStack space="lg">
                <HStack space="md">
                  {/* First Name */}
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl
                        isInvalid={!!errors.firstName}
                        className="flex-1"
                      >
                        <FormControlLabel className="mb-1">
                          <FormControlLabelText className="text-typography-600 font-medium">
                            First Name
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                          <InputField
                            placeholder="First Name"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className="text-sm px-4"
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorText>
                            {errors.firstName?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  {/* Last Name */}
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl
                        isInvalid={!!errors.lastName}
                        className="flex-1"
                      >
                        <FormControlLabel className="mb-1">
                          <FormControlLabelText className="text-typography-600 font-medium">
                            Last Name
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                          <InputField
                            placeholder="Last Name"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className="text-sm px-4"
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorText>
                            {errors.lastName?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />
                </HStack>

                {/* Student ID */}
                <Controller
                  control={control}
                  name="studentId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!errors.studentId}
                      className="w-full"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Student ID
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                        <InputSlot className="pl-3">
                          <Icon
                            as={Ionicons}
                            name="card-outline"
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="e.g. 211000000"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {errors.studentId?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Department Selection */}
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field: { value } }) => (
                    <FormControl className="w-full">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Department (Optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsDeptModalOpen(true)}
                        className="flex-row items-center justify-between rounded-full border border-outline-200 h-14 px-3"
                      >
                        <HStack className="items-center flex-1">
                          <Ionicons
                            name="business-outline"
                            size={20}
                            color="#94A3B8"
                          />
                          <Text
                            className={`ml-2 text-sm flex-1 ${
                              value
                                ? 'text-typography-900'
                                : 'text-typography-400'
                            }`}
                            numberOfLines={1}
                          >
                            {getDeptName()}
                          </Text>
                        </HStack>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />

                {/* Batch Selection */}
                <Controller
                  control={control}
                  name="batchId"
                  render={({ field: { value } }) => (
                    <FormControl className="w-full">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Batch (Optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => {
                          if (watchedDeptId) setIsBatchModalOpen(true)
                          else
                            showToast(
                              'Select Department',
                              'Please select a department first',
                              'error'
                            )
                        }}
                        className={`flex-row items-center justify-between rounded-full border border-outline-200 h-14 px-3 ${
                          !watchedDeptId ? 'bg-background-50 opacity-50' : ''
                        }`}
                        disabled={!watchedDeptId}
                      >
                        <HStack className="items-center flex-1">
                          <Ionicons
                            name="people-outline"
                            size={20}
                            color="#94A3B8"
                          />
                          <Text
                            className={`ml-2 text-sm flex-1 ${
                              value
                                ? 'text-typography-900'
                                : 'text-typography-400'
                            }`}
                            numberOfLines={1}
                          >
                            {getBatchName()}
                          </Text>
                        </HStack>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />

                {/* Section Selection */}
                <Controller
                  control={control}
                  name="sectionId"
                  render={({ field: { value } }) => (
                    <FormControl className="w-full">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Section (Optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => {
                          if (watchedBatchId) setIsSectionModalOpen(true)
                          else
                            showToast(
                              'Select Batch',
                              'Please select a batch first',
                              'error'
                            )
                        }}
                        className={`flex-row items-center justify-between rounded-full border border-outline-200 h-14 px-3 ${
                          !watchedBatchId ? 'bg-background-50 opacity-50' : ''
                        }`}
                        disabled={!watchedBatchId}
                      >
                        <HStack className="items-center flex-1">
                          <Ionicons
                            name="grid-outline"
                            size={20}
                            color="#94A3B8"
                          />
                          <Text
                            className={`ml-2 text-sm flex-1 ${
                              value
                                ? 'text-typography-900'
                                : 'text-typography-400'
                            }`}
                            numberOfLines={1}
                          >
                            {getSectionName()}
                          </Text>
                        </HStack>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />

                {/* Phone Number - Kept from original */}
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
                          {errors.phoneNumber?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Email - Kept from original */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.email} className="w-full">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Email{' '}
                          <Text className="text-typography-400 font-normal">
                            (Optional)
                          </Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
                        <InputSlot className="pl-3">
                          <Icon
                            as={Ionicons}
                            name="mail-outline"
                            size={20}
                            className="text-typography-400"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="Enter your email"
                          value={value || ''}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorIcon
                          as={Ionicons}
                          name="alert-circle-outline"
                        />
                        <FormControlErrorText>
                          {errors.email?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Password - Kept from original */}
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
                          placeholder="Create password"
                          value={value}
                          onChangeText={onChange}
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
                      <FormControlHelperText className="text-xs text-typography-400 mt-1">
                        8+ chars, 1 upper, 1 lower, 1 number, 1 special
                      </FormControlHelperText>
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

                {apiError && (
                  <Box className="bg-error-50 dark:bg-error-900/20 p-3 rounded-lg border border-error-200 dark:border-error-800">
                    <Text className="text-error-600 dark:text-error-400 text-center text-sm">
                      {apiError}
                    </Text>
                  </Box>
                )}

                <Button
                  onPress={handleSubmit(onSubmit)}
                  className="w-full rounded-full h-14 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-500/30 mt-4"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting && (
                    <ButtonSpinner color="#fff" className="mr-2" />
                  )}
                  <ButtonText className="font-poppins-bold text-white text-base">
                    Create Student Account
                  </ButtonText>
                </Button>

                <HStack className="justify-center items-center mt-4 space-x-1">
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
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Department/Batch/Section Modals */}
      <SelectModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Select Department"
        items={departments}
        loading={deptLoading}
        onSelect={(item: any) => {
          setValue('departmentId', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name} ({item.code})
          </Text>
        )}
        selectedItem={watchedDeptId ? { id: watchedDeptId } : undefined}
      />

      <SelectModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Select Batch"
        items={batches}
        loading={batchLoading}
        onSelect={(item: any) => {
          setValue('batchId', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
        )}
        selectedItem={watchedBatchId ? { id: watchedBatchId } : undefined}
      />

      <SelectModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Select Section"
        items={sections}
        loading={sectionLoading}
        onSelect={(item: any) => {
          setValue('sectionId', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id || ''}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
        )}
        selectedItem={
          watch('sectionId') ? { id: watch('sectionId') } : undefined
        }
      />
    </SafeAreaView>
  )
}

export default Register
