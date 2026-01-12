import React, { useEffect, useMemo } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_BATCH,
  GET_ALL_BATCHES,
  GET_DEPARTMENTS,
  CREATE_BATCH,
  UPDATE_BATCH,
  DELETE_BATCH,
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

const batchSchema = z.object({
  name: z.string().min(1, { message: 'Batch name is required' }),
  departmant_id: z.string().min(1, { message: 'Department is required' }),
  year: z.coerce.number().min(2000, { message: 'Year must be valid' }),
  current_semester: z.coerce
    .number()
    .min(0, { message: 'Semester must be >= 0' }),
  semester_count: z.coerce
    .number()
    .min(1, { message: 'Total semesters required' }),
})

type BatchFormValues = z.infer<typeof batchSchema>

const BatchDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS)
  const { data: batchData } = useQuery(GET_BATCH, {
    variables: { id },
    skip: !isEditing,
  })

  const departments = useMemo(
    () => deptData?.academic_department || [],
    [deptData]
  )

  const [createBatch, { loading: createLoading }] = useMutation(CREATE_BATCH)
  const [updateBatch, { loading: updateLoading }] = useMutation(UPDATE_BATCH)
  const [deleteBatch, { loading: deleteLoading }] = useMutation(DELETE_BATCH)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BatchFormValues>({
    defaultValues: {
      name: '',
      departmant_id: '',
      year: new Date().getFullYear(),
      current_semester: 1,
      semester_count: 8,
    },
    resolver: zodResolver(batchSchema) as any,
  })

  const watchedDeptId = watch('departmant_id')

  const getDepartmentDisplayName = (items: any[]) => {
    if (!watchedDeptId) return 'Select Department'
    const dept = items.find((d: any) => d.id === watchedDeptId)
    return dept ? `${dept.code} - ${dept.name}` : 'Unknown Department'
  }

  useEffect(() => {
    if (batchData?.academic_batch_by_pk) {
      const batch = batchData.academic_batch_by_pk
      reset({
        name: batch.name,
        departmant_id: batch.departmant_id,
        year: batch.year,
        current_semester: batch.current_semester,
        semester_count: batch.semester_count,
      })
    }
  }, [batchData, reset])

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Batch',
      description:
        'Are you sure you want to delete this batch? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const { data: response } = await deleteBatch({
            variables: { id },
            refetchQueries: [{ query: GET_ALL_BATCHES }],
          })

          if (response?.delete_academic_batch_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Batch deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            haptics.error()
            showAlert({
              title: 'Failed to Delete',
              description: 'Something went wrong while deleting the batch.',
              type: 'error',
            })
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting batch:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.message || 'An error occurred while deleting the batch.',
            type: 'error',
          })
        }
      },
    })
  }

  const onSubmit = async (data: BatchFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        const { data: response } = await updateBatch({
          variables: {
            id,
            set: {
              name: data.name,
              departmant_id: data.departmant_id,
              year: data.year,
              current_semester: data.current_semester,
              semester_count: data.semester_count,
            },
          },
          refetchQueries: [
            { query: GET_ALL_BATCHES },
            { query: GET_BATCH, variables: { id } },
          ],
        })

        if (response?.update_academic_batch_by_pk?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Batch updated successfully',
            type: 'success',
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Update',
            description: 'Something went wrong while updating the batch.',
            type: 'error',
          })
        }
      } else {
        const { data: response } = await createBatch({
          variables: {
            object: {
              name: data.name,
              departmant_id: data.departmant_id,
              year: data.year,
              current_semester: data.current_semester,
              semester_count: data.semester_count,
              is_active: true,
            },
          },
          refetchQueries: [{ query: GET_ALL_BATCHES }],
        })

        if (response?.insert_academic_batch_one?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Batch created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Create',
            description: 'Something went wrong while creating the batch.',
            type: 'error',
          })
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving batch:', err)
      showAlert({
        title: 'Failed to Save',
        description:
          err?.message ||
          err?.graphQLErrors?.[0]?.message ||
          'An error occurred while saving the batch.',
        type: 'error',
      })
    }
  }

  const fields: FormConfig<BatchFormValues>[] = [
    {
      type: 'select',
      name: 'departmant_id' as const,
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
      type: 'input',
      name: 'name' as const,
      label: 'Batch Name',
      placeholder: 'e.g. Batch 60',
      icon: 'people-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'year' as const,
      label: 'Year',
      placeholder: '2023',
      keyboardType: 'numeric',
    },
    {
      type: 'input',
      name: 'semester_count' as const,
      label: 'Total Semesters',
      placeholder: '8',
      keyboardType: 'numeric',
    },
    {
      type: 'input',
      name: 'current_semester' as const,
      label: 'Current Semester (0 if starting)',
      placeholder: '1',
      keyboardType: 'numeric',
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
            {isEditing ? 'Edit Batch' : 'New Batch'}
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
            text={isEditing ? 'Save Changes' : 'Create Batch'}
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
                Delete this batch
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default BatchDetailsScreen
