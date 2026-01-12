import React, { useEffect, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_STUDENT,
  GET_ALL_STUDENTS,
  GET_DEPARTMENTS_FOR_REGISTRATION,
  GET_BATCHES_FOR_REGISTRATION,
  GET_SECTIONS_FOR_REGISTRATION,
  UPDATE_STUDENT_PROFILE,
  DELETE_USER,
} from '@/lib/graphql-operations'
import { axiosClient } from '@/lib/axios'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'
import { useAlert } from '@/contexts/AlertContext'
import { FormFieldRenderer, type FormConfig } from '@/components/form'
import { AuthSubmitButton } from '@/components/auth'
import { Button, ButtonText } from '@/components/ui/button'

const studentSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(11, { message: 'Valid phone number required' }),
  student_id: z.string().min(1, { message: 'Student ID is required' }),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  department_id: z.string().min(1, { message: 'Department is required' }),
  batch_id: z.string().min(1, { message: 'Batch is required' }),
  section_id: z.string().min(1, { message: 'Section is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

const GENDER_OPTIONS = [
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
  { id: 'Other', name: 'Other' },
]

const BLOOD_GROUPS = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
]

const StudentDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: studentData } = useQuery(GET_STUDENT, {
    variables: { userId: id },
    skip: !isEditing,
  })

  const [updateStudent] = useMutation(UPDATE_STUDENT_PROFILE)
  const [deleteUser] = useMutation(DELETE_USER)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<StudentFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      student_id: '',
      gender: '',
      blood_group: '',
      department_id: '',
      batch_id: '',
      section_id: '',
      password: '',
    },
    resolver: zodResolver(studentSchema) as any,
  })

  // Dependent field watching
  const watchedDeptId = watch('department_id')
  const watchedBatchId = watch('batch_id')
  const watchedGender = watch('gender')
  const watchedBloodGroup = watch('blood_group')

  useEffect(() => {
    if (studentData?.user_profile?.[0]) {
      const student = studentData.user_profile[0]
      reset({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.user?.email || '',
        phone: student.user?.phone || '',
        student_id: student.student_id,
        gender: student.gender || '',
        blood_group: student.blood_group || '',
        department_id: student.department_id,
        batch_id: student.batch_id,
        section_id: student.section_id,
      })
    }
  }, [studentData, reset])

  // Helper for displaying current selection name without full list sometimes
  const getSelectedDisplayName = (
    items: any[],
    currentId: string,
    fallback: string
  ) => {
    if (!currentId) return fallback
    const item = items?.find((i: any) => i.id === currentId)
    return item ? item.name : 'Unknown'
  }

  const getDepartmentDisplayName = (items: any[]) =>
    getSelectedDisplayName(items, watchedDeptId, 'Select Department')

  const getBatchDisplayName = (items: any[]) =>
    getSelectedDisplayName(items, watchedBatchId, 'Select Batch')

  const getSectionDisplayName = (items: any[]) =>
    getSelectedDisplayName(items, watch('section_id'), 'Select Section')

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Student',
      description:
        'Are you sure you want to delete this student? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        setIsSubmitting(true)
        try {
          const { data: response } = await deleteUser({
            variables: { id },
            refetchQueries: [{ query: GET_ALL_STUDENTS }],
          })

          if (response?.delete_user_account_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Student deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            throw new Error('Deletion failed')
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting student:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.message || 'An error occurred while deleting the student.',
            type: 'error',
          })
        } finally {
          setIsSubmitting(false)
        }
      },
    })
  }

  const onSubmit = async (data: StudentFormValues) => {
    haptics.medium()
    setIsSubmitting(true)

    try {
      if (isEditing) {
        // Update logic
        const { data: response } = await updateStudent({
          variables: {
            userId: id,
            set: {
              first_name: data.first_name,
              last_name: data.last_name,
              student_id: data.student_id,
              gender: data.gender || null,
              blood_group: data.blood_group || null,
              department_id: data.department_id,
              batch_id: data.batch_id,
              section_id: data.section_id,
            },
          },
          refetchQueries: [
            { query: GET_ALL_STUDENTS },
            { query: GET_STUDENT, variables: { userId: id } },
          ],
        })

        if (response?.update_user_profile?.affected_rows) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Student profile updated successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          throw new Error('Update failed')
        }
      } else {
        // Create logic (Register via API)
        if (!data.password) {
          showAlert({
            title: 'Validation Error',
            description: 'Password is required for new student',
            type: 'error',
          })
          setIsSubmitting(false)
          return
        }

        const response = await axiosClient.post('/auth/register', {
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: 'student',
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            student_id: data.student_id,
            gender: data.gender,
            blood_group: data.blood_group,
            department_id: data.department_id,
            batch_id: data.batch_id,
            section_id: data.section_id,
          },
        })

        if (response.data?.session) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Student created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          throw new Error('Registration failed')
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving student:', err)
      const message =
        err?.response?.data?.message || err?.message || 'Failed to save student'
      showAlert({
        title: 'Failed to Save',
        description: message,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fields: FormConfig<StudentFormValues>[] = [
    {
      type: 'input',
      name: 'first_name' as const,
      label: 'First Name',
      placeholder: 'e.g. John',
      icon: 'person-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'last_name' as const,
      label: 'Last Name',
      placeholder: 'e.g. Doe',
      icon: 'person-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'student_id' as const,
      label: 'Student ID',
      placeholder: 'e.g. 2023-1-60-123',
      icon: 'card-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'email' as const,
      label: 'Email',
      placeholder: 'john.doe@university.edu',
      icon: 'mail-outline',
      keyboardType: 'email-address',
      required: true,
    },
    {
      type: 'input',
      name: 'phone' as const,
      label: 'Phone',
      placeholder: '+880...',
      icon: 'call-outline',
      keyboardType: 'phone-pad',
      required: true,
    },
    {
      type: 'select',
      name: 'gender' as const,
      label: 'Gender',
      placeholder: 'Select Gender',
      items: GENDER_OPTIONS,
      getValue: () => watchedGender || 'Select Gender',
      modalTitle: 'Select Gender',
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
      selectedItem: watchedGender ? { id: watchedGender } : undefined,
    },
    {
      type: 'select',
      name: 'blood_group' as const,
      label: 'Blood Group',
      placeholder: 'Select Blood Group',
      items: BLOOD_GROUPS,
      getValue: () => watchedBloodGroup || 'Select Blood Group',
      modalTitle: 'Select Blood Group',
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
      selectedItem: watchedBloodGroup ? { id: watchedBloodGroup } : undefined,
    },
    {
      type: 'select',
      name: 'department_id' as const,
      label: 'Department',
      placeholder: 'Select Department',
      icon: 'business-outline',
      required: true,
      getValue: (items: any[]) => getDepartmentDisplayName(items),
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
      selectedItem: watchedDeptId ? { id: watchedDeptId } : undefined,
    },
    {
      type: 'select',
      name: 'batch_id' as const,
      label: 'Batch',
      placeholder: 'Select Batch',
      icon: 'people-outline',
      required: true,
      disabled: !watchedDeptId,
      getValue: (items: any[]) => getBatchDisplayName(items),
      modalTitle: 'Select Batch',
      query: {
        query: GET_BATCHES_FOR_REGISTRATION,
        dataPath: 'academic_batch',
        variables: { departmentId: watchedDeptId },
        skip: !watchedDeptId,
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
      selectedItem: watchedBatchId ? { id: watchedBatchId } : undefined,
    },
    {
      type: 'select',
      name: 'section_id' as const,
      label: 'Section',
      placeholder: 'Select Section',
      icon: 'list-outline',
      required: true,
      disabled: !watchedBatchId,
      getValue: (items: any[]) => getSectionDisplayName(items),
      modalTitle: 'Select Section',
      query: {
        query: GET_SECTIONS_FOR_REGISTRATION,
        dataPath: 'academic_section',
        variables: { batchId: watchedBatchId },
        skip: !watchedBatchId,
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
      selectedItem: watch('section_id')
        ? { id: watch('section_id') }
        : undefined,
    },
  ]

  if (!isEditing) {
    fields.push({
      type: 'input',
      name: 'password' as const,
      label: 'Password',
      placeholder: '********',
      icon: 'lock-closed-outline',
      isPassword: true,
      required: true,
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <HStack className="items-center flex-1">
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.back()
            }}
            className="p-2 rounded-full mr-2"
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
      </HStack>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="lg">
          <FormFieldRenderer
            fields={fields}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          {/* Submit Button */}
          <AuthSubmitButton
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            text={isEditing ? 'Save Changes' : 'Create Student'}
          />

          {/* Delete Button */}
          {isEditing && (
            <Button
              variant="link"
              className="mt-4 rounded-full border-error-200 h-14 active:bg-error-50"
              onPress={handleDelete}
              isDisabled={isSubmitting}
            >
              <ButtonText className="text-error-500 font-bold">
                Delete this student
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default StudentDetailsScreen
