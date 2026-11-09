import React, { useCallback, useState } from 'react'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { BellOff } from 'lucide-react-native'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Notice } from '@/components/signin/Fields'
import { api, ApiError, call, unwrap } from '@/lib/api'
import { emptyInbox, inboxIcon, markAllRead, mergePage, relativeTime, type InboxItem, type InboxState } from '@/lib/inbox'
import { INBOX_ICONS } from '@/lib/inboxIcons'

const PAGE = 30

function Row({ item }: { item: InboxItem }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/notification/[id]', params: { id: item.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? '' : 'Unread. '}${item.title}. ${item.body}`}
      className={`p-4 mb-3 rounded-lg border ${
        item.read
          ? 'bg-white dark:bg-background-900 border-outline-100 dark:border-outline-800'
          : 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
      }`}
    >
      <HStack space="md" className="items-start">
        <Box className={`h-10 w-10 rounded-full items-center justify-center ${item.read ? 'bg-background-100' : 'bg-primary-100'}`}>
          <Icon as={INBOX_ICONS[inboxIcon(item)]} size={20} className={item.read ? 'text-typography-500' : 'text-primary-600'} />
        </Box>
        <VStack className="flex-1">
          <HStack className="justify-between items-start">
            <Text className={`text-base flex-1 text-typography-900 ${item.read ? 'font-semibold' : 'font-bold'}`} numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-xs text-typography-400 ml-2">{relativeTime(item.createdAt)}</Text>
          </HStack>
          <Text className="text-typography-600 mt-1" numberOfLines={3}>
            {item.body}
          </Text>
          {item.from ? <Text className="text-xs text-typography-400 mt-1">From {item.from}</Text> : null}
        </VStack>
        {item.read ? null : <View className="h-2.5 w-2.5 rounded-full bg-primary-500 mt-1.5" accessibilityElementsHidden />}
      </HStack>
    </Pressable>
  )
}

/** The inbox (UX review decision 4): every notice addressed to me, newest first, with read state. */
export default function NotificationsScreen() {
  const [inbox, setInbox] = useState<InboxState>()
  const [problem, setProblem] = useState<ApiError>()
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async (before?: string) => {
    try {
      const page = await call(async () =>
        unwrap(await api.GET('/api/v1/me/notifications', { params: { query: { limit: PAGE, ...(before ? { before } : {}) } } }))
      )
      setInbox((current) => mergePage(current ?? emptyInbox, page, !!before))
      setProblem(undefined)
    } catch (error) {
      setProblem(error as ApiError)
    }
  }, [])

  // Opening a notice marks it read on the server; reload on focus to pick that up.
  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const loadMore = async () => {
    if (!inbox?.nextBefore || loadingMore) return
    setLoadingMore(true)
    await load(inbox.nextBefore)
    setLoadingMore(false)
  }

  const readAll = async () => {
    if (!inbox) return
    const before = inbox
    setInbox(markAllRead(inbox))
    try {
      await call(async () => unwrap(await api.POST('/api/v1/me/notifications/read-all')))
    } catch (error) {
      setInbox(before)
      setProblem(error as ApiError)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950" edges={['top']}>
      <HStack className="px-4 pt-4 pb-3 items-center justify-between">
        <VStack>
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Notifications
          </Heading>
          {inbox ? (
            <Text className="text-typography-500 text-sm">{inbox.unreadCount ? `${inbox.unreadCount} unread` : 'All caught up'}</Text>
          ) : null}
        </VStack>
        {inbox?.unreadCount ? (
          <Pressable onPress={readAll} accessibilityRole="button" className="min-h-[44px] justify-center px-2">
            <Text className="text-primary-600 font-semibold">Mark all read</Text>
          </Pressable>
        ) : null}
      </HStack>

      {problem ? (
        <View className="px-4 mb-3">
          <Notice message={problem.message} action={{ label: 'Try again', onPress: onRefresh }} />
        </View>
      ) : null}

      {!inbox && !problem ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" accessibilityLabel="Loading notifications" />
        </Box>
      ) : (
        <FlatList
          data={inbox?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Row item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <Spinner className="my-4" /> : null}
          ListEmptyComponent={
            inbox ? (
              <VStack className="items-center py-20" space="sm">
                <Icon as={BellOff} size={40} className="text-typography-300" />
                <Text className="text-typography-700 font-semibold">No notifications yet</Text>
                <Text className="text-typography-500 text-center px-8">Class changes and notices from your teachers and department show up here.</Text>
              </VStack>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}
