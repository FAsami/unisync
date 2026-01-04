import React, { useState, useMemo, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'
import {
  GET_DEPARTMENTS,
  GET_FACULTIES,
  GET_FACULTY,
  UPDATE_FACULTY_PROFILE,
  DELETE_USER,
  GET_ALL_FACULTIES_LIST,
} from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
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
} from '@/components/ui/form-control'
import { SelectModal } from '@/components/ui/SelectModal'
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { Box } from '@/components/ui/box'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const facultySchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phone: z
    .string()
    .min(11, { message: 'Valid phone number is required' })
    .refine((val) => val.startsWith('+880'), {
      message: 'Must start with +880',
    }),
  password: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),

  // Faculty specific
  facultyId: z.string().min(1, { message: 'Faculty ID is required' }),
  designation: z.string().min(1, { message: 'Designation is required' }),
  departmentId: z.string().min(1, { message: 'Department is required' }),
  description: z.string().optional(),
})

type FacultyFormValues = z.infer<typeof facultySchema>

const designations = [
  'Lecturer',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Head of Department',
  'Dean',
]

const FacultyDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new' && id !== undefined

  const toast = useToast()
  const haptics = useHaptics()
  const { currentMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Queries
  const { data: deptData } = useQuery(GET_DEPARTMENTS)
  const { data: academicFacultyData } = useQuery(GET_FACULTIES)
  const {
    data: facultyData,
    loading: facultyLoading,
    error: facultyError,
  } = useQuery(GET_FACULTY, {
    variables: { userId: id },
    skip: !isEditing,
  })

  // Mutations
  const [updateFaculty] = useMutation(UPDATE_FACULTY_PROFILE)
  const [deleteUser] = useMutation(DELETE_USER)

  const departments = useMemo(
    () => deptData?.academic_department || [],
    [deptData]
  )
  const academicFaculties = useMemo(
    () => academicFacultyData?.academic_faculty || [],
    [academicFacultyData]
  )

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FacultyFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+880',
      password: '',
      email: '',
      facultyId: '',
      designation: 'Lecturer',
      departmentId: '',
      description: '',
    },
    resolver: zodResolver(facultySchema),
  })

  useEffect(() => {
    if (facultyData?.user_faculty?.[0]) {
      const faculty = facultyData.user_faculty[0]
      reset({
        firstName: faculty.first_name,
        lastName: faculty.last_name,
        phone: faculty.user?.phone || '+880',
        email: faculty.user?.email || '',
        facultyId: faculty.faculty_id,
        designation: faculty.designation,
        departmentId: faculty.department_id,
        description: faculty.description || '',
        password: '',
      })
    }
  }, [facultyData, reset])

  // Watches
  const watchedDeptId = watch('departmentId')
  const watchedFacultyId = watch('facultyId')
  const watchedDesignation = watch('designation')

  const getDeptName = () =>
    departments.find((d: any) => d.id === watchedDeptId)?.name ||
    'Select Department'

  const getFacultyName = () =>
    academicFaculties.find((f: any) => f.id === watchedFacultyId)?.name ||
    'Select Faculty'

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'success'
  ) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast
          nativeID={id}
          action={action}
          variant="outline"
          className="mt-12 bg-white dark:bg-background-50 rounded-xl border-outline-100"
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
      ),
    })
  }

  const onSubmit = async (data: FacultyFormValues) => {
    haptics.medium()
    setIsSubmitting(true)
    try {
      if (isEditing) {
        // Update Profile
        await updateFaculty({
          variables: {
            userId: id,
            set: {
              first_name: data.firstName,
              last_name: data.lastName,
              faculty_id: data.facultyId,
              designation: data.designation,
              department_id: data.departmentId,
              description: data.description || null,
            },
          },
          refetchQueries: [
            { query: GET_ALL_FACULTIES_LIST },
            { query: GET_FACULTY, variables: { userId: id } },
          ],
        })
        showToast('Success', 'Faculty updated successfully')
      } else {
        // Create
        if (!data.password) {
          throw new Error('Password is required for new faculty')
        }
        const payload = {
          phone: data.phone,
          password: data.password,
          email: data.email || undefined,
          role: 'teacher',
          first_name: data.firstName,
          last_name: data.lastName,
          faculty_id: data.facultyId,
          designation: data.designation,
          department_id: data.departmentId,
          description: data.description || undefined,
        }

        await axiosClient.post('/auth/register', payload)
        showToast('Success', 'Faculty created successfully')
        router.back()
      }
      haptics.success()
    } catch (err: any) {
      haptics.error()
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to save faculty'
      showToast('Error', msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!isEditing) return
    haptics.warning()
    Alert.alert(
      'Delete Faculty',
      'Are you sure you want to delete this faculty member? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser({
                variables: { id },
                refetchQueries: [{ query: GET_ALL_FACULTIES_LIST }],
              })
              haptics.success()
              router.back()
            } catch (err) {
              haptics.error()
              showToast('Error', 'Failed to delete faculty', 'error')
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full hover:bg-background-50 dark:hover:bg-background-800 mr-2"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
          />
        </TouchableOpacity>
        <Heading size="md" className="font-bold text-typography-900">
          {isEditing ? 'Edit Faculty' : 'New Faculty'}
        </Heading>
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="xl">
            {/* Personal Info */}
            <VStack space="md">
              <Heading
                size="sm"
                className="text-typography-500 uppercase text-xs font-bold"
              >
                Personal Information
              </Heading>

              <HStack space="md">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      isInvalid={!!errors.firstName}
                      className="flex-1"
                    >
                      <FormControlLabel>
                        <FormControlLabelText>First Name</FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl h-12">
                        <InputField
                          value={value}
                          onChangeText={onChange}
                          placeholder="John"
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
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      isInvalid={!!errors.lastName}
                      className="flex-1"
                    >
                      <FormControlLabel>
                        <FormControlLabelText>Last Name</FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl h-12">
                        <InputField
                          value={value}
                          onChangeText={onChange}
                          placeholder="Doe"
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

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.phone}>
                    <FormControlLabel>
                      <FormControlLabelText>Phone</FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl h-12" isDisabled={isEditing}>
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        keyboardType="phone-pad"
                        placeholder="+8801..."
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.phone?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel>
                      <FormControlLabelText>
                        Email (Optional)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl h-12" isDisabled={isEditing}>
                      <InputField
                        value={value || ''}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        placeholder="john@example.com"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.email?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {!isEditing && (
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <FormControl isInvalid={!!errors.password}>
                      <FormControlLabel>
                        <FormControlLabelText>Password</FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl h-12">
                        <InputField
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry
                          placeholder="******"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.password?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />
              )}
            </VStack>

            {/* Professional Info */}
            <VStack space="md">
              <Heading
                size="sm"
                className="text-typography-500 uppercase text-xs font-bold"
              >
                Professional Information
              </Heading>

              <Controller
                control={control}
                name="facultyId"
                render={() => (
                  <FormControl isInvalid={!!errors.facultyId}>
                    <FormControlLabel>
                      <FormControlLabelText>Faculty</FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsFacultyModalOpen(true)}
                      className="border border-outline-200 rounded-xl h-12 px-3 justify-center"
                    >
                      <Text>{getFacultyName()}</Text>
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.facultyId?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="departmentId"
                render={() => (
                  <FormControl isInvalid={!!errors.departmentId}>
                    <FormControlLabel>
                      <FormControlLabelText>Department</FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsDeptModalOpen(true)}
                      className="border border-outline-200 rounded-xl h-12 px-3 justify-center"
                    >
                      <Text>{getDeptName()}</Text>
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.departmentId?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="designation"
                render={() => (
                  <FormControl isInvalid={!!errors.designation}>
                    <FormControlLabel>
                      <FormControlLabelText>Designation</FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsDesignationModalOpen(true)}
                      className="border border-outline-200 rounded-xl h-12 px-3 justify-center"
                    >
                      <Text>{watchedDesignation}</Text>
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.designation?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText>
                        Description (Optional)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl h-24">
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        multiline
                        placeholder="Bio, research interests, etc."
                        textAlignVertical="top"
                      />
                    </Input>
                  </FormControl>
                )}
              />
            </VStack>

            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting || facultyLoading}
              className="rounded-full h-14 bg-primary-500 mt-4"
            >
              {isSubmitting ? (
                <ButtonSpinner color="white" />
              ) : (
                <ButtonText className="font-bold">
                  {isEditing ? 'Update Faculty' : 'Create Faculty'}
                </ButtonText>
              )}
            </Button>

            {isEditing && (
              <Button
                variant="link"
                className="mt-4 rounded-full border-error-200 h-14 active:bg-error-50"
                onPress={handleDelete}
                isDisabled={isSubmitting}
              >
                <ButtonText className="text-error-500 font-bold">
                  Delete Faculty
                </ButtonText>
              </Button>
            )}

            <Box className="h-10" />
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SelectModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Select Department"
        items={departments}
        onSelect={(item: any) =>
          setValue('departmentId', item.id, { shouldValidate: true })
        }
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
      />

      <SelectModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title="Select Faculty"
        items={academicFaculties}
        onSelect={(item: any) =>
          setValue('facultyId', item.id, { shouldValidate: true })
        }
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
      />

      <SelectModal
        isOpen={isDesignationModalOpen}
        onClose={() => setIsDesignationModalOpen(false)}
        title="Select Designation"
        items={designations.map((d) => ({ id: d, name: d }))}
        onSelect={(item: any) => setValue('designation', item.id)}
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
        enableSearch={false}
      />
    </SafeAreaView>
  )
}

export default FacultyDetailsScreen
