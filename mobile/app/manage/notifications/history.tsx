import React from 'react'
import { ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { GET_MY_SENT_NOTIFICATIONS } from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Badge, BadgeText } from '@/components/ui/badge'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

export default function NotificationHistoryScreen() {
  const haptics = useHaptics()
  const { currentMode } = useTheme()

  const { data, loading, refetch } = useQuery(GET_MY_SENT_NOTIFICATIONS)
  const notifications = data?.notification_log || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-success-500'
      case 'processing':
        return 'bg-warning-500'
      case 'failed':
        return 'bg-error-500'
      default:
        return 'bg-outline-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            Notification History
          </Heading>
        </HStack>
        <TouchableOpacity
          onPress={() => {
            haptics.light()
            router.push('/manage/notifications/compose')
          }}
          className="p-2 rounded-full"
        >
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={currentMode === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        {notifications.length === 0 ? (
          <Box className="items-center justify-center py-20">
            <Box className="bg-primary-500/10 p-4 rounded-full mb-4">
              <Ionicons
                name="notifications-outline"
                size={32}
                color="#8B5CF6"
              />
            </Box>
            <Heading size="sm" className="text-typography-900 mb-2">
              No Notifications Yet
            </Heading>
            <Text className="text-typography-500 text-center mb-6">
              Send your first notification to get started
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/manage/notifications/compose')}
              className="bg-primary-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">
                Send Notification
              </Text>
            </TouchableOpacity>
          </Box>
        ) : (
          <VStack space="md">
            {notifications.map((notification: any) => (
              <Box
                key={notification.id}
                className="bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800"
              >
                <VStack space="xs">
                  {/* Title and Status */}
                  <HStack className="items-start justify-between mb-2">
                    <Text
                      className="text-typography-900 font-semibold text-base flex-1 mr-2"
                      numberOfLines={2}
                    >
                      {notification.title}
                    </Text>
                    <Badge
                      className={`${getStatusColor(
                        notification.status
                      )} rounded-full`}
                    >
                      <BadgeText className="text-white text-xs capitalize">
                        {notification.status}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  {/* Body */}
                  <Text
                    className="text-typography-600 text-sm mb-2"
                    numberOfLines={3}
                  >
                    {notification.body}
                  </Text>

                  {/* Metadata */}
                  <HStack className="items-center justify-between">
                    <HStack className="items-center space-x-3">
                      {/* Target Type */}
                      <HStack className="items-center">
                        <Ionicons
                          name="people-outline"
                          size={14}
                          color="#94A3B8"
                        />
                        <Text className="text-typography-500 text-xs ml-1 capitalize">
                          {notification.target_type}
                        </Text>
                      </HStack>

                      {/* Sent Count */}
                      {notification.status === 'sent' && (
                        <HStack className="items-center">
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={14}
                            color="#10B981"
                          />
                          <Text className="text-success-600 text-xs ml-1">
                            {notification.sent_count} sent
                          </Text>
                        </HStack>
                      )}

                      {/* Failed Count */}
                      {notification.failed_count > 0 && (
                        <HStack className="items-center">
                          <Ionicons
                            name="close-circle-outline"
                            size={14}
                            color="#EF4444"
                          />
                          <Text className="text-error-600 text-xs ml-1">
                            {notification.failed_count} failed
                          </Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Date */}
                    <Text className="text-typography-400 text-xs">
                      {formatDate(notification.created_at)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
