import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  SEND_CUSTOM_NOTIFICATION,
  GET_ALL_SECTIONS,
  GET_ALL_BATCHES,
  GET_DEPARTMENTS,
} from '@/lib/graphql-operations'

import { SelectModal } from '@/components/ui/SelectModal'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import { Textarea, TextareaInput } from '@/components/ui/textarea'
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
import { useAuth } from '@/contexts/Auth'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  body: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  target_type: z.enum(['section', 'batch', 'department', 'all']),
  target_id: z.string().uuid().optional(),
})

type NotificationFormValues = z.infer<typeof notificationSchema>

const TARGET_TYPES = [
  { label: 'My Section', value: 'section' },
  { label: 'Whole Batch', value: 'batch' },
  { label: 'Department', value: 'department' },
  { label: 'All Users', value: 'all' },
]

export default function ComposeNotificationScreen() {
  const { userRole } = useAuth()
  const haptics = useHaptics()
  const toast = useToast()
  const { currentMode } = useTheme()

  const [isTargetTypeModalOpen, setIsTargetTypeModalOpen] = useState(false)
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)

  const {
    data: sectionsData,
    loading: sectionsLoading,
    error: sectionsError,
  } = useQuery(GET_ALL_SECTIONS)
  const {
    data: batchesData,
    loading: batchesLoading,
    error: batchesError,
  } = useQuery(GET_ALL_BATCHES)
  const {
    data: departmentsData,
    loading: departmentsLoading,
    error: departmentsError,
  } = useQuery(GET_DEPARTMENTS)
  console.log('=====>', sectionsError, batchesError, departmentsError)
  const [sendNotification, { loading: sending, error: sendingError }] =
    useMutation(SEND_CUSTOM_NOTIFICATION)

  console.log('sending ERROR', sendingError)
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NotificationFormValues>({
    defaultValues: {
      title: '',
      body: '',
      target_type: 'section',
      target_id: '',
    },
    resolver: zodResolver(notificationSchema) as any,
  })

  const watchedTargetType = watch('target_type')
  const watchedTargetId = watch('target_id')

  // Filter target types based on role
  const availableTargetTypes = React.useMemo(() => {
    if (userRole === 'class_representative') {
      return TARGET_TYPES.filter((t) => t.value === 'section')
    }
    return TARGET_TYPES
  }, [userRole])

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

  const getTargetDisplayName = () => {
    if (watchedTargetType === 'all') return 'All Users'
    if (!watchedTargetId) return 'Select Target'

    switch (watchedTargetType) {
      case 'section':
        const section = sectionsData?.academic_section?.find(
          (s: any) => s.id === watchedTargetId
        )
        return section
          ? `${section.batch?.department?.name} - ${section.batch?.name} - ${section.name}`
          : 'Unknown Section'
      case 'batch':
        const batch = batchesData?.academic_batch?.find(
          (b: any) => b.id === watchedTargetId
        )
        return batch
          ? `${batch.department?.name} - ${batch.name}`
          : 'Unknown Batch'
      case 'department':
        const dept = departmentsData?.academic_department?.find(
          (d: any) => d.id === watchedTargetId
        )
        return dept ? dept.name : 'Unknown Department'
      default:
        return 'Select Target'
    }
  }

  const getTargetOptions = () => {
    switch (watchedTargetType) {
      case 'section':
        return (
          sectionsData?.academic_section?.map((s: any) => ({
            id: s.id,
            label: `${s.batch?.department?.name} - ${s.batch?.name} - ${s.name}`,
          })) || []
        )
      case 'batch':
        return (
          batchesData?.academic_batch?.map((b: any) => ({
            id: b.id,
            label: `${b.department?.name} - ${b.name}`,
          })) || []
        )
      case 'department':
        return (
          departmentsData?.academic_department?.map((d: any) => ({
            id: d.id,
            label: d.name,
          })) || []
        )
      default:
        return []
    }
  }

  const onSubmit = async (data: NotificationFormValues) => {
    haptics.medium()
    try {
      await sendNotification({
        variables: {
          object: {
            title: data.title,
            body: data.body,
            target_type: data.target_type,
            target_id: data.target_type === 'all' ? null : data.target_id,
          },
        },
      })
      haptics.success()
      showToast('Success', 'Notification sent successfully')
      reset()
      router.back()
    } catch (error: any) {
      haptics.error()
      console.error('Error sending notification:', error)
      showToast('Error', error.message || 'Failed to send', 'error')
    }
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
            Send Notification
          </Heading>
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="lg">
          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.title}>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText className="text-typography-600 font-medium">
                    Title <Text className="text-error-500">*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="rounded-xl border-outline-200 bg-transparent h-14">
                  <InputField
                    placeholder="e.g., Quiz Tomorrow"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className="text-sm"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>
                    {errors.title?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          {/* Body */}
          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.body}>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText className="text-typography-600 font-medium">
                    Message <Text className="text-error-500">*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Textarea className="rounded-xl border-outline-200 bg-transparent min-h-32">
                  <TextareaInput
                    placeholder="Enter your message here..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className="text-sm"
                  />
                </Textarea>
                <FormControlError>
                  <FormControlErrorText>
                    {errors.body?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          {/* Target Type */}
          <Controller
            control={control}
            name="target_type"
            render={({ field: { value } }) => (
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText className="text-typography-600 font-medium">
                    Send To
                  </FormControlLabelText>
                </FormControlLabel>
                <TouchableOpacity
                  onPress={() => setIsTargetTypeModalOpen(true)}
                  className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3 bg-white dark:bg-background-900"
                >
                  <HStack className="items-center">
                    <Ionicons name="people-outline" size={18} color="#94A3B8" />
                    <Text className="text-sm text-typography-900 ml-2">
                      {availableTargetTypes.find((t) => t.value === value)
                        ?.label || 'Select'}
                    </Text>
                  </HStack>
                  <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </FormControl>
            )}
          />

          {/* Target ID (if not 'all') */}
          {watchedTargetType !== 'all' && (
            <Controller
              control={control}
              name="target_id"
              render={({ field: { value } }) => (
                <FormControl isInvalid={!!errors.target_id}>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-typography-600 font-medium">
                      Select{' '}
                      {watchedTargetType.charAt(0).toUpperCase() +
                        watchedTargetType.slice(1)}{' '}
                      <Text className="text-error-500">*</Text>
                    </FormControlLabelText>
                  </FormControlLabel>
                  <TouchableOpacity
                    onPress={() => setIsTargetModalOpen(true)}
                    className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3 bg-white dark:bg-background-900"
                  >
                    <Text
                      className={`text-sm flex-1 ${
                        value ? 'text-typography-900' : 'text-typography-400'
                      }`}
                      numberOfLines={1}
                    >
                      {getTargetDisplayName()}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.target_id?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />
          )}

          {/* Send Button */}
          <Button
            className="rounded-full bg-primary-500 mt-4"
            onPress={handleSubmit(onSubmit)}
            isDisabled={sending}
          >
            {sending && <ButtonSpinner className="mr-2" />}
            <ButtonText>
              {sending ? 'Sending...' : 'Send Notification'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>

      {/* Target Type Modal */}
      <SelectModal
        isOpen={isTargetTypeModalOpen}
        onClose={() => setIsTargetTypeModalOpen(false)}
        title="Send To"
        items={availableTargetTypes}
        keyExtractor={(item) => item.value}
        selectedItem={availableTargetTypes.find(
          (t) => t.value === watchedTargetType
        )}
        onSelect={(item) => {
          setValue('target_type', item.value as any)
          setValue('target_id', '')
          setIsTargetTypeModalOpen(false)
        }}
        renderItem={(item) => (
          <Text className="text-typography-900">{item.label}</Text>
        )}
      />

      {/* Target Modal */}
      <SelectModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title={`Select ${
          watchedTargetType.charAt(0).toUpperCase() + watchedTargetType.slice(1)
        }`}
        items={getTargetOptions()}
        keyExtractor={(item) => item.id}
        selectedItem={getTargetOptions().find(
          (t: { id: string; label: string }) => t.id === watchedTargetId
        )}
        onSelect={(item) => {
          setValue('target_id', item.id)
          setIsTargetModalOpen(false)
        }}
        renderItem={(item) => (
          <Text className="text-typography-900">{item.label}</Text>
        )}
      />
    </SafeAreaView>
  )
}
