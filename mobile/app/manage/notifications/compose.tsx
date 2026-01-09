import React, { useMemo } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useMutation } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  SEND_CUSTOM_NOTIFICATION,
  GET_ALL_SECTIONS,
  GET_ALL_BATCHES,
  GET_DEPARTMENTS,
} from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'
import { useAuth } from '@/contexts/Auth'
import { useAlert } from '@/contexts/AlertContext'
import { FormFieldRenderer, type FormConfig } from '@/components/form'
import { AuthSubmitButton } from '@/components/auth'

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
  const { userRole, userId } = useAuth()
  const haptics = useHaptics()
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()

  const [sendNotification, { loading: sending }] = useMutation(
    SEND_CUSTOM_NOTIFICATION
  )

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
  const availableTargetTypes = useMemo(() => {
    if (userRole === 'class_representative') {
      return TARGET_TYPES.filter((t) => t.value === 'section')
    }
    return TARGET_TYPES
  }, [userRole])

  const getTargetDisplayName = (items: any[]) => {
    if (watchedTargetType === 'all') return 'All Users'
    if (!watchedTargetId) return 'Select Target'

    const item = items.find((i: any) => i.id === watchedTargetId)
    if (!item) return 'Select Target'

    switch (watchedTargetType) {
      case 'section':
        return `${item.batch?.department?.name} - ${item.batch?.name} - ${item.name}`
      case 'batch':
        return `${item.department?.name} - ${item.name}`
      case 'department':
        return item.name
      default:
        return 'Select Target'
    }
  }

  const fields: FormConfig<NotificationFormValues>[] = [
    {
      type: 'input',
      name: 'title' as const,
      label: 'Title',
      placeholder: 'e.g., Quiz Tomorrow',
      required: true,
      maxLength: 100,
    },
    {
      type: 'textarea',
      name: 'body' as const,
      label: 'Message',
      placeholder: 'Enter your message here...',
      required: true,
      maxLength: 500,
      minHeight: 128,
    },
    {
      type: 'select',
      name: 'target_type' as const,
      label: 'Send To',
      placeholder: 'Select Target Type',
      icon: 'people-outline',
      items: availableTargetTypes,
      getValue: () =>
        availableTargetTypes.find((t) => t.value === watchedTargetType)
          ?.label || 'Select',
      modalTitle: 'Send To',
      keyExtractor: (item: any) => item.value,
      renderItem: (item: any) => (
        <Text className="text-typography-900">{item.label}</Text>
      ),
      selectedItem: availableTargetTypes.find(
        (t) => t.value === watchedTargetType
      )
        ? { value: watchedTargetType }
        : undefined,
    },
    {
      type: 'select',
      name: 'target_id' as const,
      label: `Select ${
        watchedTargetType.charAt(0).toUpperCase() + watchedTargetType.slice(1)
      }`,
      placeholder: 'Select Target',
      required: true,
      shouldRender: watchedTargetType !== 'all',
      getValue: (items: any[]) => getTargetDisplayName(items),
      modalTitle: `Select ${
        watchedTargetType.charAt(0).toUpperCase() + watchedTargetType.slice(1)
      }`,
      query: {
        query:
          watchedTargetType === 'section'
            ? GET_ALL_SECTIONS
            : watchedTargetType === 'batch'
            ? GET_ALL_BATCHES
            : GET_DEPARTMENTS,
        dataPath:
          watchedTargetType === 'section'
            ? 'academic_section'
            : watchedTargetType === 'batch'
            ? 'academic_batch'
            : 'academic_department',
      },
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => {
        let label = ''
        switch (watchedTargetType) {
          case 'section':
            label = `${item.batch?.department?.name} - ${item.batch?.name} - ${item.name}`
            break
          case 'batch':
            label = `${item.department?.name} - ${item.name}`
            break
          case 'department':
            label = item.name
            break
        }
        return (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {label}
          </Text>
        )
      },
      selectedItem: watchedTargetId ? { id: watchedTargetId } : undefined,
    },
  ]

  const onSubmit = async (data: NotificationFormValues) => {
    haptics.medium()
    try {
      const { data: response, errors } = await sendNotification({
        variables: {
          object: {
            title: data.title,
            body: data.body,
            target_type: data.target_type,
            target_id: data.target_type === 'all' ? null : data.target_id,
            ...(userRole === 'admin' && userId ? { created_by: userId } : {}),
          },
        },
      })
      if (response?.insert_notification_log_one?.id) {
        haptics.success()
        showAlert({
          title: 'Success',
          description: 'Notification sent successfully',
          type: 'success',
          onConfirm: () => {
            reset()
            router.back()
          },
        })
      } else {
        haptics.error()
        showAlert({
          title: 'Failed to Send',
          description: 'Something went wrong while sending the notification.',
          type: 'error',
        })
      }
    } catch (error: any) {
      haptics.error()
      console.error('Error sending notification:', error)
      showAlert({
        title: 'Failed to Send',
        description:
          error?.message ||
          error?.graphQLErrors?.[0]?.message ||
          'An error occurred while sending the notification. Please try again.',
        type: 'error',
      })
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
          <FormFieldRenderer
            fields={fields}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          {/* Send Button */}
          <AuthSubmitButton
            onPress={handleSubmit(onSubmit)}
            isLoading={sending}
            text="Send Notification"
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}
