import React, { useEffect } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_DEPARTMENT,
  GET_DEPARTMENTS,
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  DELETE_DEPARTMENT,
  GET_ALL_FACULTIES_FOR_PICKER,
} from '@/lib/graphql-operations'

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

const departmentSchema = z.object({
  name: z.string().min(1, { message: 'Department name is required' }),
  code: z
    .string()
    .min(1, { message: 'Code is required' })
    .max(10, { message: 'Code too long' }),
  description: z.string().optional(),
  head_user_id: z.string().optional().nullable(),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

const DepartmentDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()

  const { data: deptData } = useQuery(GET_DEPARTMENT, {
    variables: { id },
    skip: !isEditing,
  })

  // We can fetch initial head of department details if needed,
  // but GET_DEPARTMENT already returns head_of_department relation.

  const [createDepartment, { loading: createLoading }] =
    useMutation(CREATE_DEPARTMENT)
  const [updateDepartment, { loading: updateLoading }] =
    useMutation(UPDATE_DEPARTMENT)
  const [deleteDepartment, { loading: deleteLoading }] =
    useMutation(DELETE_DEPARTMENT)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DepartmentFormValues>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      head_user_id: null,
    },
    resolver: zodResolver(departmentSchema) as any,
  })

  const watchedHeadId = watch('head_user_id')

  useEffect(() => {
    if (deptData?.academic_department_by_pk) {
      const dept = deptData.academic_department_by_pk
      reset({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        head_user_id: dept.head_user_id || null,
      })
    }
  }, [deptData, reset])

  const getHeadDisplayName = (items: any[]) => {
    // If we have items from the picker query
    if (watchedHeadId && items && items.length > 0) {
      const selected = items.find((item: any) => item.user_id === watchedHeadId)
      if (selected) {
        return `${selected.first_name} ${selected.last_name} (${
          selected.designation || 'Faculty'
        })`
      }
    }

    // Fallback if not found in picker list but present in initial data
    if (
      watchedHeadId &&
      deptData?.academic_department_by_pk?.head_of_department
    ) {
      const head = deptData.academic_department_by_pk.head_of_department
      const profile = head.profiles?.[0]
      if (profile) {
        return `${profile.first_name} ${profile.last_name}`
      }
      return head.email || 'Unknown User'
    }

    if (watchedHeadId) return 'Loading User...'

    return 'Select Head of Department'
  }

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Department',
      description:
        'Are you sure you want to delete this department? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const { data: response } = await deleteDepartment({
            variables: { id },
            refetchQueries: [{ query: GET_DEPARTMENTS }],
          })

          if (response?.delete_academic_department_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Department deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            haptics.error()
            showAlert({
              title: 'Failed to Delete',
              description:
                'Something went wrong while deleting the department.',
              type: 'error',
            })
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting department:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.graphQLErrors?.[0]?.message ||
              err?.message ||
              'An error occurred while deleting the department.',
            type: 'error',
          })
        }
      },
    })
  }

  const onSubmit = async (data: DepartmentFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        const { data: response } = await updateDepartment({
          variables: {
            id,
            set: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              head_user_id: data.head_user_id || null,
            },
          },
          refetchQueries: [
            { query: GET_DEPARTMENTS },
            { query: GET_DEPARTMENT, variables: { id } },
          ],
        })

        if (response?.update_academic_department_by_pk?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Department updated successfully',
            type: 'success',
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Update',
            description: 'Something went wrong while updating the department.',
            type: 'error',
          })
        }
      } else {
        const { data: response } = await createDepartment({
          variables: {
            object: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              head_user_id: data.head_user_id || null,
              is_active: true,
            },
          },
          refetchQueries: [{ query: GET_DEPARTMENTS }],
        })

        if (response?.insert_academic_department_one?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Department created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Create',
            description: 'Something went wrong while creating the department.',
            type: 'error',
          })
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving department:', err)
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        'Failed to save department'
      showAlert({
        title: 'Failed to Save',
        description: errorMessage.includes('unique constraint')
          ? 'Department code or name already exists'
          : errorMessage,
        type: 'error',
      })
    }
  }

  const fields: FormConfig<DepartmentFormValues>[] = [
    {
      type: 'input',
      name: 'name' as const,
      label: 'Department Name',
      placeholder: 'e.g. Computer Science',
      icon: 'business-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'code' as const,
      label: 'Department Code',
      placeholder: 'e.g. CSE',
      icon: 'code-slash-outline',
      required: true,
    },
    {
      type: 'select',
      name: 'head_user_id' as const,
      label: 'Head of Department',
      placeholder: 'Select Head of Department',
      icon: 'person-outline',
      modalTitle: 'Select Faculty',
      query: {
        query: GET_ALL_FACULTIES_FOR_PICKER,
        dataPath: 'user_faculty',
      },
      keyExtractor: (item: any) => item.user_id,
      getValue: (items: any[]) => getHeadDisplayName(items),
      renderItem: (item: any, isSelected: boolean) => (
        <VStack>
          <Text
            className={`text-base font-medium ${
              isSelected ? 'text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.first_name} {item.last_name}
          </Text>
          <Text className="text-sm text-typography-500">
            {item.designation || 'Faculty'}
          </Text>
        </VStack>
      ),
      selectedItem: watchedHeadId ? { user_id: watchedHeadId } : undefined,
    },
    {
      type: 'textarea',
      name: 'description' as const,
      label: 'Description (Optional)',
      placeholder: 'About this department...',
      minHeight: 128,
    },
  ]

  const isLoading = createLoading || updateLoading || deleteLoading

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
            {isEditing ? 'Edit Department' : 'New Department'}
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
            isLoading={isLoading}
            text={isEditing ? 'Save Changes' : 'Create Department'}
          />

          {/* Delete Button */}
          {isEditing && (
            <Button
              variant="link"
              className="mt-4 rounded-full border-error-200 h-14 active:bg-error-50"
              onPress={handleDelete}
              isDisabled={isLoading}
            >
              <ButtonText className="text-error-500 font-bold">
                Delete this department
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default DepartmentDetailsScreen
