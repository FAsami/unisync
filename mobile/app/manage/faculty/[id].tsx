import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_FACULTY,
  GET_ALL_FACULTIES_LIST,
  UPDATE_FACULTY_PROFILE,
  GET_DEPARTMENTS,
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

const facultySchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(11, { message: 'Valid phone number required' }),
  designation: z.string().min(1, { message: 'Designation is required' }),
  department_id: z.string().min(1, { message: 'Department is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .optional(),
})

type FacultyFormValues = z.infer<typeof facultySchema>

const DESIGNATIONS = [
  { id: 'Lecturer', name: 'Lecturer' },
  { id: 'Assistant Professor', name: 'Assistant Professor' },
  { id: 'Associate Professor', name: 'Associate Professor' },
  { id: 'Professor', name: 'Professor' },
  { id: 'Head of Department', name: 'Head of Department' },
]

const FacultyDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: deptData } = useQuery(GET_DEPARTMENTS)
  const { data: facultyData } = useQuery(GET_FACULTY, {
    variables: { userId: id },
    skip: !isEditing,
  })

  const [updateFaculty] = useMutation(UPDATE_FACULTY_PROFILE)
  const [deleteUser] = useMutation(DELETE_USER)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FacultyFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      designation: '',
      department_id: '',
      password: '',
    },
    resolver: zodResolver(facultySchema) as any,
  })

  const watchedDeptId = watch('department_id')
  const watchedDesignation = watch('designation')

  useEffect(() => {
    if (facultyData?.user_faculty?.[0]) {
      const faculty = facultyData.user_faculty[0]
      reset({
        first_name: faculty.first_name,
        last_name: faculty.last_name,
        email: faculty.user?.email || '',
        phone: faculty.user?.phone || '',
        designation: faculty.designation,
        department_id: faculty.department_id,
      })
    }
  }, [facultyData, reset])

  const getDepartmentDisplayName = (items: any[]) => {
    if (!watchedDeptId) return 'Select Department'
    const dept = items.find((d: any) => d.id === watchedDeptId)
    return dept ? `${dept.code} - ${dept.name}` : 'Unknown Department'
  }

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Faculty',
      description:
        'Are you sure you want to delete this faculty member? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        setIsSubmitting(true)
        try {
          const { data: response } = await deleteUser({
            variables: { id },
            refetchQueries: [{ query: GET_ALL_FACULTIES_LIST }],
          })

          if (response?.delete_user_account_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Faculty deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            throw new Error('Deletion failed')
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting faculty:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.message || 'An error occurred while deleting the faculty.',
            type: 'error',
          })
        } finally {
          setIsSubmitting(false)
        }
      },
    })
  }

  const onSubmit = async (data: FacultyFormValues) => {
    haptics.medium()
    setIsSubmitting(true)

    try {
      if (isEditing) {
        // Update logic
        const { data: response } = await updateFaculty({
          variables: {
            userId: id,
            set: {
              first_name: data.first_name,
              last_name: data.last_name,
              designation: data.designation,
              department_id: data.department_id,
            },
          },
          refetchQueries: [
            { query: GET_ALL_FACULTIES_LIST },
            { query: GET_FACULTY, variables: { userId: id } },
          ],
        })

        // Note: Updating email/phone on user_account is skipped here for simplicity
        // as per typical specialized update flows, but could be added if needed via separate mutation.

        if (response?.update_user_faculty?.affected_rows) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Faculty updated successfully',
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
            description: 'Password is required for new faculty',
            type: 'error',
          })
          setIsSubmitting(false)
          return
        }

        const response = await axiosClient.post('/auth/register', {
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: 'faculty',
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            designation: data.designation,
            department_id: data.department_id,
          },
        })

        if (response.data?.session) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Faculty created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          throw new Error('Registration failed')
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving faculty:', err)
      const message =
        err?.response?.data?.message || err?.message || 'Failed to save faculty'
      showAlert({
        title: 'Failed to Save',
        description: message,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fields: FormConfig<FacultyFormValues>[] = [
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
      name: 'department_id' as const,
      label: 'Department',
      placeholder: 'Select Department',
      icon: 'business-outline',
      required: true,
      getValue: (items: any[]) => getDepartmentDisplayName(items),
      modalTitle: 'Select Department',
      query: {
        query: GET_DEPARTMENTS,
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
      name: 'designation' as const,
      label: 'Designation',
      placeholder: 'Select Designation',
      items: DESIGNATIONS,
      getValue: () => watchedDesignation || 'Select Designation',
      modalTitle: 'Select Designation',
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
      selectedItem: watchedDesignation ? { id: watchedDesignation } : undefined,
    },
  ]

  if (!isEditing) {
    fields.push({
      type: 'input',
      name: 'password' as const,
      label: 'Password',
      placeholder: '********',
      icon: 'lock-closed-outline',
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
            {isEditing ? 'Edit Faculty' : 'New Faculty'}
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
            text={isEditing ? 'Save Changes' : 'Create Faculty'}
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
                Delete this faculty member
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default FacultyDetailsScreen
