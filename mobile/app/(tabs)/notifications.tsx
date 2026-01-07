import React from 'react'
import { Text, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Class Cancelled',
    message: 'Data Structure class has been cancelled for today.',
    time: '2 hours ago',
    read: false,
    type: 'alert',
  },
  {
    id: '2',
    title: 'Assignment Due',
    message: 'Operating System assignment is due tomorrow.',
    time: '5 hours ago',
    read: true,
    type: 'info',
  },
  {
    id: '3',
    title: 'New Event',
    message: 'Tech Fest registration is now open!',
    time: '1 day ago',
    read: true,
    type: 'event',
  },
]

const NotificationItem = ({
  item,
}: {
  item: (typeof DUMMY_NOTIFICATIONS)[0]
}) => {
  return (
    <Box
      className={`p-4 mb-3 rounded-xl border ${
        item.read
          ? 'bg-white dark:bg-background-900 border-outline-100 dark:border-outline-800'
          : 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800'
      }`}
    >
      <HStack className="space-x-2 gap-2 items-center">
        <Box
          className={`p-2 h-12 w-12 rounded-full flex items-center justify-center ${
            item.read
              ? 'bg-background-100 dark:bg-background-800'
              : 'bg-primary-100 dark:bg-primary-800'
          }`}
        >
          <Icon
            as={Ionicons}
            name={
              item.type === 'alert'
                ? 'warning-outline'
                : item.type === 'event'
                ? 'calendar-outline'
                : 'notifications-outline'
            }
            size={20}
            className={
              item.read
                ? 'text-typography-500'
                : 'text-primary-600 dark:text-primary-400'
            }
          />
        </Box>
        <VStack className="flex-1 space-y-1 gap-1">
          <HStack className="justify-between items-start">
            <Text
              className={`text-base font-bold ${
                item.read ? 'text-typography-900' : 'text-typography-900'
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-typography-400">{item.time}</Text>
          </HStack>
          <Text className="text-typography-500 leading-tight">
            {item.message}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

const NotificationsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <VStack className="px-4 py-4 space-y-4 gap-4 flex-1">
        <Heading size="2xl" className="font-extrabold text-typography-900">
          Notifications
        </Heading>

        <FlatList
          data={DUMMY_NOTIFICATIONS}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
