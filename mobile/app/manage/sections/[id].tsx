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
  GET_SECTION,
  GET_ALL_SECTIONS,
  GET_ALL_BATCHES,
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
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

const sectionSchema = z.object({
  name: z.string().min(1, { message: 'Section name is required' }),
  batch_id: z.string().min(1, { message: 'Batch is required' }),
  capacity: z.coerce
    .number()
    .min(1, { message: 'Capacity must be at least 1' }),
})

type SectionFormValues = z.infer<typeof sectionSchema>

const SectionDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()

  const { data: sectionData } = useQuery(GET_SECTION, {
    variables: { id },
    skip: !isEditing,
  })

  // We rely on picker query for batches

  const [createSection, { loading: createLoading }] =
    useMutation(CREATE_SECTION)
  const [updateSection, { loading: updateLoading }] =
    useMutation(UPDATE_SECTION)
  const [deleteSection, { loading: deleteLoading }] =
    useMutation(DELETE_SECTION)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SectionFormValues>({
    defaultValues: {
      name: '',
      batch_id: '',
      capacity: 35,
    },
    resolver: zodResolver(sectionSchema) as any,
  })

  const watchedBatchId = watch('batch_id')

  useEffect(() => {
    if (sectionData?.academic_section_by_pk) {
      const section = sectionData.academic_section_by_pk
      reset({
        name: section.name,
        batch_id: section.batch_id,
        capacity: section.capacity,
      })
    }
  }, [sectionData, reset])

  const getBatchDisplayName = (items: any[]) => {
    if (!watchedBatchId) return 'Select Batch'
    const batch = items.find((b: any) => b.id === watchedBatchId)
    if (batch) {
      return `${batch.name} (${batch.department?.code || 'No Dept'})`
    }
    return 'Unknown Batch'
  }

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Section',
      description:
        'Are you sure you want to delete this section? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const { data: response } = await deleteSection({
            variables: { id },
            refetchQueries: [{ query: GET_ALL_SECTIONS }],
          })

          if (response?.delete_academic_section_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Section deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            haptics.error()
            showAlert({
              title: 'Failed to Delete',
              description: 'Something went wrong while deleting the section.',
              type: 'error',
            })
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting section:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.graphQLErrors?.[0]?.message ||
              err?.message ||
              'An error occurred while deleting the section.',
            type: 'error',
          })
        }
      },
    })
  }

  const onSubmit = async (data: SectionFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        const { data: response } = await updateSection({
          variables: {
            id,
            set: {
              name: data.name,
              batch_id: data.batch_id,
              capacity: data.capacity,
            },
          },
          refetchQueries: [
            { query: GET_ALL_SECTIONS },
            { query: GET_SECTION, variables: { id } },
          ],
        })

        if (response?.update_academic_section_by_pk?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Section updated successfully',
            type: 'success',
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Update',
            description: 'Something went wrong while updating the section.',
            type: 'error',
          })
        }
      } else {
        const { data: response } = await createSection({
          variables: {
            object: {
              name: data.name,
              batch_id: data.batch_id,
              capacity: data.capacity,
              is_active: true,
            },
          },
          refetchQueries: [{ query: GET_ALL_SECTIONS }],
        })

        if (response?.insert_academic_section_one?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Section created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Create',
            description: 'Something went wrong while creating the section.',
            type: 'error',
          })
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving section:', err)
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        'Failed to save section'
      showAlert({
        title: 'Failed to Save',
        description: errorMessage.includes('unique constraint')
          ? 'Section name already exists in this batch'
          : errorMessage,
        type: 'error',
      })
    }
  }

  const fields: FormConfig<SectionFormValues>[] = [
    {
      type: 'select',
      name: 'batch_id' as const,
      label: 'Batch',
      placeholder: 'Select Batch',
      icon: 'people-outline',
      required: true,
      getValue: (items: any[]) => getBatchDisplayName(items),
      modalTitle: 'Select Batch',
      query: {
        query: GET_ALL_BATCHES,
        dataPath: 'academic_batch',
      },
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => (
        <VStack>
          <Text
            className={`text-base font-medium ${
              isSelected ? 'text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
          <Text className="text-sm text-typography-500">
            {item.department?.code
              ? `Department: ${item.department.code}`
              : 'No Department'}
          </Text>
        </VStack>
      ),
      selectedItem: watchedBatchId ? { id: watchedBatchId } : undefined,
    },
    {
      type: 'input',
      name: 'name' as const,
      label: 'Section Name',
      placeholder: 'e.g. A',
      icon: 'list-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'capacity' as const,
      label: 'Capacity',
      placeholder: '35',
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
            {isEditing ? 'Edit Section' : 'New Section'}
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
            text={isEditing ? 'Save Changes' : 'Create Section'}
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
                Delete this section
              </ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SectionDetailsScreen
