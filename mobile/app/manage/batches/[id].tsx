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
import { useForm, Controller, type Resolver } from 'react-hook-form'
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

import { SelectModal } from '@/components/ui/SelectModal'

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
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

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
  const toast = useToast()
  const { currentMode } = useTheme()

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS)
  const { data: batchData, loading: dataLoading } = useQuery(GET_BATCH, {
    variables: { id },
    skip: !isEditing,
  })

  // Departments for dropdown
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
    resolver: zodResolver(batchSchema) as Resolver<BatchFormValues>,
  })

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const watchedDeptId = watch('departmant_id')

  const getDepartmentDisplayName = () => {
    if (!watchedDeptId) return 'Select Department'
    const dept = departments.find((d: any) => d.id === watchedDeptId)
    return dept ? dept.code : 'Unknown Department'
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
      'Delete Batch',
      'Are you sure you want to delete this batch? This action cannot be undone.',
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
              await deleteBatch({
                variables: { id },
                refetchQueries: [{ query: GET_ALL_BATCHES }],
              })
              haptics.success()
              router.back()
            } catch (err) {
              haptics.error()
              console.error('Error deleting batch:', err)
              Alert.alert('Error', 'Failed to delete batch')
            }
          },
        },
      ]
    )
  }

  const onSubmit = async (data: BatchFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        await updateBatch({
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
        showToast('Success', 'Batch updated')
      } else {
        await createBatch({
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
        showToast('Success', 'Batch created')
        router.back()
      }
      haptics.success()
    } catch (err: any) {
      haptics.error()
      console.error('Error saving batch:', err)
      showToast('Error', 'Failed to save batch', 'error')
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
              {isEditing ? 'Edit Batch' : 'New Batch'}
            </Heading>
          </VStack>
        </HStack>
        {isEditing && (
          <Button
            variant="link"
            onPress={handleSubmit((data) =>
              onSubmit(data as unknown as BatchFormValues)
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
              {/* Department Selection */}
              <Controller
                control={control}
                name="departmant_id"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.departmant_id}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Department <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsDeptModalOpen(true)}
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
                          {getDepartmentDisplayName()}
                        </Text>
                      </HStack>
                      <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.departmant_id?.message}
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
                        Batch Name <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. Batch 60"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
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

              <HStack space="md">
                {/* Year */}
                <Controller
                  control={control}
                  name="year"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.year} className="flex-1">
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Year
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                        <InputField
                          placeholder="2023"
                          value={String(value)}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.year?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Semester Count */}
                <Controller
                  control={control}
                  name="semester_count"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!errors.semester_count}
                      className="flex-1"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Total Semesters
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                        <InputField
                          placeholder="8"
                          value={String(value)}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.semester_count?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />
              </HStack>

              {/* Current Semester */}
              <Controller
                control={control}
                name="current_semester"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.current_semester}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Current Semester (0 if starting)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputField
                        placeholder="1"
                        value={String(value)}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.current_semester?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {!isEditing && (
                <Button
                  className="mt-4 rounded-full bg-primary-500 h-14"
                  onPress={handleSubmit((data) =>
                    onSubmit(data as unknown as BatchFormValues)
                  )}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <ButtonText className="font-bold">Create Batch</ButtonText>
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
                    Delete this batch
                  </ButtonText>
                </Button>
              )}
            </VStack>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <SelectModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Select Department"
        items={departments}
        loading={deptLoading}
        onSelect={(item: any) => {
          setValue('departmant_id', item.id, { shouldValidate: true })
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
    </SafeAreaView>
  )
}

export default BatchDetailsScreen
