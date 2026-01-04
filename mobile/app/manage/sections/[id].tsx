import React, { useEffect, useState, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_SECTION,
  GET_ALL_BATCHES,
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
  GET_ALL_SECTIONS,
} from '@/lib/graphql-operations'

import { SelectModal } from '@/components/ui/SelectModal'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control'
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

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
  const toast = useToast()
  const { currentMode } = useTheme()

  const { data: batchData, loading: batchesLoading } = useQuery(GET_ALL_BATCHES)
  const { data: sectionData, loading: dataLoading } = useQuery(GET_SECTION, {
    variables: { id },
    skip: !isEditing,
  })

  // Batches for dropdown
  const batches = useMemo(() => batchData?.academic_batch || [], [batchData])

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
      capacity: 60,
    },
    resolver: zodResolver(sectionSchema) as any,
  })

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const watchedBatchId = watch('batch_id')

  const getBatchDisplayName = () => {
    if (!watchedBatchId) return 'Select Batch'
    const batch = batches.find((b: any) => b.id === watchedBatchId)
    return batch
      ? `${batch.name} (${batch.department?.code || ''})`
      : 'Unknown Batch'
  }

  useEffect(() => {
    if (sectionData?.academic_section_by_pk) {
      const section = sectionData.academic_section_by_pk
      reset({
        name: section.name,
        batch_id: section.batch_id,
        capacity: section.capacity || 60,
      })
    }
  }, [sectionData, reset])

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'success'
  ) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
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
        )
      },
    })
  }

  const handleDelete = () => {
    if (!isEditing) return
    haptics.medium()
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSection({
                variables: { id },
                refetchQueries: [{ query: GET_ALL_SECTIONS }],
              })
              haptics.success()
              router.back()
            } catch (err) {
              haptics.error()
              console.error('Error deleting section:', err)
              Alert.alert('Error', 'Failed to delete section')
            }
          },
        },
      ]
    )
  }

  const onSubmit = async (data: SectionFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        await updateSection({
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
        showToast('Success', 'Section updated')
      } else {
        await createSection({
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
        showToast('Success', 'Section created')
        router.back()
      }
      haptics.success()
    } catch (err: any) {
      haptics.error()
      console.error('Error saving section:', err)
      if (err.message.includes('Uniqueness violation')) {
        showToast('Error', 'Section name already exists in this batch', 'error')
      } else {
        showToast('Error', 'Failed to save section', 'error')
      }
    }
  }

  const isLoading =
    dataLoading || createLoading || updateLoading || deleteLoading

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <HStack className="items-center">
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.back()
            }}
            className="p-2 rounded-full hover:bg-background-50 dark:hover:bg-background-800 mr-2"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
            />
          </TouchableOpacity>
          <VStack>
            <Heading size="md" className="font-bold text-typography-900">
              {isEditing ? 'Edit Section' : 'New Section'}
            </Heading>
          </VStack>
        </HStack>
        {isEditing && (
          <Button
            variant="link"
            onPress={handleSubmit((data) =>
              onSubmit(data as unknown as SectionFormValues)
            )}
            isDisabled={isLoading}
          >
            {isLoading ? (
              <ButtonSpinner />
            ) : (
              <ButtonText className="text-primary-500 font-bold">
                Save
              </ButtonText>
            )}
          </Button>
        )}
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {dataLoading ? (
          <ActivityIndicator className="mt-20" size="large" color="#8B5CF6" />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <VStack space="xl" className="mt-2">
              {/* Batch Selection */}
              <Controller
                control={control}
                name="batch_id"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.batch_id}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Batch <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsBatchModalOpen(true)}
                      className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                    >
                      <HStack className="items-center">
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color="#94A3B8"
                        />
                        <Text
                          className={`ml-2 text-sm ${
                            value
                              ? 'text-typography-900'
                              : 'text-typography-400'
                          }`}
                        >
                          {getBatchDisplayName()}
                        </Text>
                      </HStack>
                      <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.batch_id?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Section Name <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="pricetag-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. A"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="characters"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <FormControlErrorText className="ml-1">
                        {errors.name?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Capacity */}
              <Controller
                control={control}
                name="capacity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.capacity}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Capacity
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputField
                        placeholder="60"
                        value={String(value)}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.capacity?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Quick Actions - Only show when editing */}
              {isEditing && (
                <VStack space="md" className="mt-6">
                  <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2">
                    Quick Actions
                  </Text>

                  {/* Manage Course Offerings Button */}
                  <TouchableOpacity
                    onPress={() => {
                      haptics.light()
                      router.push(`/manage/sections/offerings?id=${id}`)
                    }}
                    className="flex-row items-center justify-between bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800"
                  >
                    <HStack className="items-center flex-1">
                      <Box className="bg-primary-500/10 p-2 rounded-lg mr-3">
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color="#8B5CF6"
                        />
                      </Box>
                      <VStack className="flex-1">
                        <Text className="text-typography-900 font-semibold text-base">
                          Manage Course Offerings
                        </Text>
                        <Text className="text-typography-500 text-xs">
                          Add and assign courses to this section
                        </Text>
                      </VStack>
                    </HStack>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={currentMode === 'dark' ? '#94A3B8' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {/* View Class Schedule Button */}
                  <TouchableOpacity
                    onPress={() => {
                      haptics.light()
                      router.push(`/manage/sections/routine?id=${id}`)
                    }}
                    className="flex-row items-center justify-between bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800"
                  >
                    <HStack className="items-center flex-1">
                      <Box className="bg-success-500/10 p-2 rounded-lg mr-3">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#059669"
                        />
                      </Box>
                      <VStack className="flex-1">
                        <Text className="text-typography-900 font-semibold text-base">
                          View Class Schedule
                        </Text>
                        <Text className="text-typography-500 text-xs">
                          Create and manage weekly routine
                        </Text>
                      </VStack>
                    </HStack>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={currentMode === 'dark' ? '#94A3B8' : '#64748B'}
                    />
                  </TouchableOpacity>
                </VStack>
              )}

              {!isEditing && (
                <Button
                  className="mt-4 rounded-full bg-primary-500 h-14"
                  onPress={handleSubmit((data) =>
                    onSubmit(data as unknown as SectionFormValues)
                  )}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <ButtonText className="font-bold">
                      Create Section
                    </ButtonText>
                  )}
                </Button>
              )}

              {isEditing && (
                <Button
                  variant="link"
                  className="mt-8 rounded-full border-error-200 h-14 active:bg-error-50"
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
        )}
      </KeyboardAvoidingView>

      <SelectModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Select Batch"
        items={batches}
        loading={batchesLoading}
        onSelect={(item: any) => {
          setValue('batch_id', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name} ({item.department?.code || ''})
          </Text>
        )}
        selectedItem={watchedBatchId ? { id: watchedBatchId } : undefined}
      />
    </SafeAreaView>
  )
}

export default SectionDetailsScreen
