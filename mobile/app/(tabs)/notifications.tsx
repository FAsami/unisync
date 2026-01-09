/**
 * TODO:
 * Handnle role for notifications according to user role
 */
import React from 'react'
import { Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@apollo/client'

import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { useAuth } from '@/contexts/Auth'
import {
  GET_USER_NOTIFICATIONS,
  GET_USER_PROFILE_FOR_NOTIFICATIONS,
  type GetUserNotificationsData,
  type GetUserProfileForNotificationsData,
  type UserNotification,
} from '@/lib/graphql-operations'
import { getRelativeTime } from '@/lib/time-utils'

const getNotificationIcon = (notification: UserNotification) => {
  const notificationType = notification.data?.type || notification.target_type

  switch (notificationType) {
    case 'alert':
    case 'cancellation':
      return 'warning-outline'
    case 'event':
    case 'exam':
      return 'calendar-outline'
    case 'assignment':
      return 'document-text-outline'
    case 'announcement':
      return 'megaphone-outline'
    default:
      return 'notifications-outline'
  }
}

const NotificationItem = ({ item }: { item: UserNotification }) => {
  const isUnread = item.status === 'pending' || item.status === 'processing'

  return (
    <Box
      className={`p-4 mb-3 rounded-xl border ${
        isUnread
          ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800'
          : 'bg-white dark:bg-background-900 border-outline-100 dark:border-outline-800'
      }`}
    >
      <HStack className="space-x-2 gap-2 items-start">
        <Box
          className={`p-2 h-12 w-12 rounded-full flex items-center justify-center ${
            isUnread
              ? 'bg-primary-100 dark:bg-primary-800'
              : 'bg-background-100 dark:bg-background-800'
          }`}
        >
          <Icon
            as={Ionicons}
            name={getNotificationIcon(item)}
            size={20}
            className={
              isUnread
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-typography-500'
            }
          />
        </Box>
        <VStack className="flex-1 space-y-1 gap-1">
          <HStack className="justify-between items-start">
            <Text
              className={`text-base font-bold flex-1 ${
                isUnread ? 'text-typography-900' : 'text-typography-900'
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-typography-400 ml-2">
              {getRelativeTime(item.created_at)}
            </Text>
          </HStack>
          <Text className="text-typography-500 leading-tight">{item.body}</Text>
          {item.sent_count > 0 && (
            <Text className="text-xs text-typography-400 mt-1">
              Sent to {item.sent_count}{' '}
              {item.sent_count === 1 ? 'user' : 'users'}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  )
}

const NotificationsScreen = () => {
  const { userId } = useAuth()
  const { data: profileData } = useQuery<GetUserProfileForNotificationsData>(
    GET_USER_PROFILE_FOR_NOTIFICATIONS,
    {
      variables: { userId },
      skip: !userId,
    }
  )

  const profile = profileData?.user_profile?.[0]
  const { data, loading, error, refetch } = useQuery<GetUserNotificationsData>(
    GET_USER_NOTIFICATIONS,
    {
      variables: {
        sectionId: profile?.section_id,
        batchId: profile?.batch_id,
        departmentId: profile?.department_id,
      },
      skip: !userId || !profile,
    }
  )

  const notifications = data?.notification_log || []

  if (loading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
        <VStack className="px-4 py-4 space-y-4 gap-4 flex-1">
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Notifications
          </Heading>
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-typography-400 mt-4">
              Loading notifications...
            </Text>
          </Box>
        </VStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
        <VStack className="px-4 py-4 space-y-4 gap-4 flex-1">
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Notifications
          </Heading>
          <Box className="flex-1 items-center justify-center py-20">
            <Icon
              as={Ionicons}
              name="alert-circle-outline"
              size={48}
              className="text-error-500 mb-4"
            />
            <Text className="text-typography-900 font-semibold mb-2">
              Failed to Load
            </Text>
            <Text className="text-typography-400 text-center mb-4 px-8">
              {error.message || 'Unable to fetch notifications'}
            </Text>
            <Box
              className="px-6 py-3 bg-primary-600 rounded-lg"
              onTouchEnd={() => refetch()}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Box>
          </Box>
        </VStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <VStack className="px-4 py-4 space-y-4 gap-4 flex-1">
        <Heading size="2xl" className="font-extrabold text-typography-900">
          Notifications
        </Heading>

        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ListEmptyComponent={
            <Box className="flex-1 items-center justify-center py-20">
              <Icon
                as={Ionicons}
                name="notifications-off-outline"
                size={48}
                className="text-typography-300 mb-4"
              />
              <Text className="text-typography-400 text-center">
                No notifications yet
              </Text>
            </Box>
          }
        />
      </VStack>
    </SafeAreaView>
  )
}

export default NotificationsScreen
