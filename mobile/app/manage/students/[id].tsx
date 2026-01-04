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
  GET_ALL_BATCHES,
  GET_ALL_SECTIONS,
  GET_STUDENT,
  UPDATE_STUDENT_PROFILE,
  DELETE_USER,
  GET_ALL_STUDENTS,
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

const studentSchema = z.object({
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

  // Student specific
  studentId: z.string().min(1, { message: 'Student ID is required' }),
  departmentId: z.string().min(1, { message: 'Department is required' }),
  batchId: z.string().min(1, { message: 'Batch is required' }),
  sectionId: z.string().min(1, { message: 'Section is required' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

const StudentDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new' && id !== undefined

  const toast = useToast()
  const haptics = useHaptics()
  const { currentMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Queries
  const { data: deptData } = useQuery(GET_DEPARTMENTS)
  const { data: batchData } = useQuery(GET_ALL_BATCHES)
  const { data: sectionData } = useQuery(GET_ALL_SECTIONS)

  const { data: studentData, loading: studentLoading } = useQuery(GET_STUDENT, {
    variables: { userId: id },
    skip: !isEditing,
  })

  // Mutations
  const [updateStudent] = useMutation(UPDATE_STUDENT_PROFILE)
  const [deleteUser] = useMutation(DELETE_USER)

  const departments = useMemo(
    () => deptData?.academic_department || [],
    [deptData]
  )
  const batches = useMemo(() => batchData?.academic_batch || [], [batchData])
  const sections = useMemo(
    () => sectionData?.academic_section || [],
    [sectionData]
  )

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false)
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<StudentFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+880',
      password: '',
      email: '',
      studentId: '',
      departmentId: '',
      batchId: '',
      sectionId: '',
      gender: 'Male',
      bloodGroup: '',
      address: '',
    },
    resolver: zodResolver(studentSchema),
  })

  // Load existing data
  useEffect(() => {
    if (studentData?.user_profile?.[0]) {
      const student = studentData.user_profile[0]
      reset({
        firstName: student.first_name,
        lastName: student.last_name,
        phone: student.user?.phone || '+880',
        email: student.user?.email || '',
        studentId: student.student_id,
        departmentId: student.department_id,
        batchId: student.batch_id || '',
        sectionId: student.section_id || '',
        gender: student.gender || 'Male',
        bloodGroup: student.blood_group || '',
        address: student.address || '',
        password: '', // Don't fill password
      })
    }
  }, [studentData, reset])

  const watchedDeptId = watch('departmentId')
  const watchedBatchId = watch('batchId')
  const watchedSectionId = watch('sectionId')
  const watchedGender = watch('gender')
  const watchedBloodGroup = watch('bloodGroup')

  // Filtered lists
  const filteredBatches = useMemo(() => {
    if (!watchedDeptId) return []
    return batches.filter((b: any) => b.departmant_id === watchedDeptId)
  }, [batches, watchedDeptId])

  const filteredSections = useMemo(() => {
    if (!watchedBatchId) return []
    return sections.filter((s: any) => s.batch_id === watchedBatchId)
  }, [sections, watchedBatchId])

  // Reset downstream fields when parents change
  useEffect(() => {
    if (watchedDeptId && !isEditing) {
      // Only reset if we're not unrelatedly loading initial data,
      // but simpler: just check if the current batch is valid for this new dept?
      // For now, let's just not auto-reset on load (handled by isEditing check crudely or assume user interaction)
      // Actually, relying on `setValue` inside `useEffect` with dependencies can be tricky with standard form initialization.
      // Better to handle reset in the `onSelect` of the parent.
    }
  }, [watchedDeptId])

  const getDeptName = () =>
    departments.find((d: any) => d.id === watchedDeptId)?.name ||
    'Select Department'
  const getBatchName = () =>
    batches.find((b: any) => b.id === watchedBatchId)?.name || 'Select Batch'
  const getSectionName = () =>
    sections.find((s: any) => s.id === watchedSectionId)?.name ||
    'Select Section'

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

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        const { data: updateResult } = await updateStudent({
          variables: {
            userId: id,
            set: {
              first_name: data.firstName,
              last_name: data.lastName,
              student_id: data.studentId,
              department_id: data.departmentId,
              batch_id: data.batchId,
              section_id: data.sectionId,
              gender: data.gender,
              blood_group: data.bloodGroup || null,
              address: data.address || null,
            },
          },
          refetchQueries: [
            { query: GET_ALL_STUDENTS },
            { query: GET_STUDENT, variables: { userId: id } },
          ],
        })
        if (!updateResult?.update_user_account_one) {
          Alert.alert('Error', 'Failed to update student')
          return
        }

        Alert.alert('Success', 'Student updated successfully')
        router.back()
      } else {
        if (!data.password) {
          throw new Error('Password is required for new students')
        }
        const payload = {
          phone: data.phone,
          password: data.password,
          email: data.email || undefined,
          role: 'student',
          first_name: data.firstName,
          last_name: data.lastName,
          student_id: data.studentId,
          department_id: data.departmentId,
          batch_id: data.batchId,
          section_id: data.sectionId,
          gender: data.gender,
          blood_group: data.bloodGroup || undefined,
          address: data.address || undefined,
        }

        const result = await axiosClient.post('/auth/register', payload)
        console.log(result.data)
        if (result.data?.data?.userId) {
          Alert.alert('Success', 'Student created successfully')
          router.back()
        } else {
          Alert.alert('Error', 'Failed to create student')
        }
      }

      haptics.success()
    } catch (err: any) {
      haptics.error()
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to save student'
      showToast('Error', msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!isEditing) return
    haptics.warning()
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser({
                variables: { id },
                refetchQueries: [{ query: GET_ALL_STUDENTS }],
              })
              haptics.success()
              router.back()
            } catch (err) {
              haptics.error()
              showToast('Error', 'Failed to delete student', 'error')
            }
          },
        },
      ]
    )
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['Male', 'Female', 'Other']

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />
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
          {isEditing ? 'Edit Student' : 'New Student'}
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

              <HStack space="md">
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { value } }) => (
                    <FormControl isInvalid={!!errors.gender} className="flex-1">
                      <FormControlLabel>
                        <FormControlLabelText>Gender</FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsGenderModalOpen(true)}
                        className="border border-outline-200 rounded-xl h-12 px-3 justify-center"
                      >
                        <Text>{watchedGender}</Text>
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="bloodGroup"
                  render={({ field: { value } }) => (
                    <FormControl className="flex-1">
                      <FormControlLabel>
                        <FormControlLabelText>Blood Group</FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsBloodModalOpen(true)}
                        className="border border-outline-200 rounded-xl h-12 px-3 justify-center"
                      >
                        <Text>{watchedBloodGroup || 'Select'}</Text>
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />
              </HStack>

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText>
                        Address (Optional)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl h-20">
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        multiline
                        placeholder="Full Address"
                      />
                    </Input>
                  </FormControl>
                )}
              />
            </VStack>

            {/* Academic Info */}
            <VStack space="md">
              <Heading
                size="sm"
                className="text-typography-500 uppercase text-xs font-bold"
              >
                Academic Information
              </Heading>

              <Controller
                control={control}
                name="studentId"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.studentId}>
                    <FormControlLabel>
                      <FormControlLabelText>Student ID</FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl h-12">
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        placeholder="e.g. 2023..."
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.studentId?.message}
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

              <HStack space="md">
                <Controller
                  control={control}
                  name="batchId"
                  render={() => (
                    <FormControl
                      isInvalid={!!errors.batchId}
                      className="flex-1"
                    >
                      <FormControlLabel>
                        <FormControlLabelText>Batch</FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsBatchModalOpen(true)}
                        disabled={!watchedDeptId}
                        className={`border border-outline-200 rounded-xl h-12 px-3 justify-center ${
                          !watchedDeptId ? 'bg-background-50 opacity-50' : ''
                        }`}
                      >
                        <Text numberOfLines={1}>
                          {!watchedDeptId
                            ? 'Select Dept First'
                            : getBatchName()}
                        </Text>
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="sectionId"
                  render={() => (
                    <FormControl
                      isInvalid={!!errors.sectionId}
                      className="flex-1"
                    >
                      <FormControlLabel>
                        <FormControlLabelText>Section</FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsSectionModalOpen(true)}
                        disabled={!watchedBatchId}
                        className={`border border-outline-200 rounded-xl h-12 px-3 justify-center ${
                          !watchedBatchId ? 'bg-background-50 opacity-50' : ''
                        }`}
                      >
                        <Text numberOfLines={1}>
                          {!watchedBatchId
                            ? 'Select Batch First'
                            : getSectionName()}
                        </Text>
                      </TouchableOpacity>
                    </FormControl>
                  )}
                />
              </HStack>
            </VStack>

            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting || studentLoading}
              className="rounded-full h-14 bg-primary-500 mt-4"
            >
              {isSubmitting ? (
                <ButtonSpinner color="white" />
              ) : (
                <ButtonText className="font-bold">
                  {isEditing ? 'Update Student' : 'Create Student'}
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
                  Delete Student
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
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Select Batch"
        items={filteredBatches}
        onSelect={(item: any) =>
          setValue('batchId', item.id, { shouldValidate: true })
        }
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
      />
      <SelectModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Select Section"
        items={filteredSections}
        onSelect={(item: any) =>
          setValue('sectionId', item.id, { shouldValidate: true })
        }
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
      />
      <SelectModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        title="Select Gender"
        items={genders.map((g) => ({ id: g, name: g }))}
        onSelect={(item: any) => setValue('gender', item.id)}
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
        enableSearch={false}
      />
      <SelectModal
        isOpen={isBloodModalOpen}
        onClose={() => setIsBloodModalOpen(false)}
        title="Select Blood Group"
        items={bloodGroups.map((g) => ({ id: g, name: g }))}
        onSelect={(item: any) => setValue('bloodGroup', item.id)}
        keyExtractor={(item) => item.id}
        renderItem={(item: any) => <Text>{item.name}</Text>}
        enableSearch={false}
      />
    </SafeAreaView>
  )
}

export default StudentDetailsScreen
