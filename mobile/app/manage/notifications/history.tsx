import React, { useCallback, useState } from 'react'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { ArrowLeft, Send, Users } from 'lucide-react-native'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Notice } from '@/components/signin/Fields'
import { api, ApiError, call, unwrap } from '@/lib/api'
import { relativeTime, sentStatus, type SentItem } from '@/lib/inbox'

const toneClass = { info: 'text-info-700', success: 'text-success-700', warning: 'text-warning-800' }

function Row({ item }: { item: SentItem }) {
  const status = sentStatus(item)
  const reads = Number(item.readCount)
  return (
    <VStack className="p-4 mb-3 rounded-2xl border border-outline-100 dark:border-outline-800 bg-white dark:bg-background-900" space="xs">
      <HStack className="justify-between items-start">
        <Text className="text-base font-bold text-typography-900 flex-1" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-xs text-typography-400 ml-2">{relativeTime(item.createdAt)}</Text>
      </HStack>
      <Text className="text-typography-600" numberOfLines={3}>
        {item.body}
      </Text>
      <HStack space="xs" className="items-center mt-1">
        <Icon as={Users} size={14} className="text-typography-400" />
        <Text className="text-typography-500 text-xs">{item.audience}</Text>
      </HStack>
      <HStack className="justify-between mt-1">
        <Text className={`text-xs font-semibold ${toneClass[status.tone]}`}>{status.label}</Text>
        <Text className="text-xs text-typography-500">
          Read by {reads} {reads === 1 ? 'person' : 'people'}
        </Text>
      </HStack>
    </VStack>
  )
}

/** Notices I sent (GET /notifications/sent), newest first, with push and read counts. */
export default function SentScreen() {
  const [items, setItems] = useState<SentItem[]>()
  const [problem, setProblem] = useState<ApiError>()
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await call(async () => unwrap(await api.GET('/api/v1/notifications/sent'))))
      setProblem(undefined)
    } catch (error) {
      setProblem(error as ApiError)
    }
  }, [])

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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="items-center px-2 py-2">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" className="p-3">
          <Icon as={ArrowLeft} size={22} className="text-typography-900" />
        </Pressable>
        <Heading size="md" className="text-typography-900 flex-1">
          Sent notices
        </Heading>
        <Pressable onPress={() => router.push('/manage/notifications/compose')} accessibilityRole="button" className="px-3 min-h-[44px] justify-center">
          <Text className="text-primary-600 font-semibold">New</Text>
        </Pressable>
      </HStack>

      {problem ? (
        <View className="px-4 mb-3">
          <Notice message={problem.message} action={{ label: 'Try again', onPress: onRefresh }} />
        </View>
      ) : null}

      {!items && !problem ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" accessibilityLabel="Loading" />
        </Box>
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Row item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            items ? (
              <VStack className="items-center py-16" space="sm">
                <Icon as={Send} size={40} className="text-typography-300" />
                <Text className="text-typography-700 font-semibold">Nothing sent yet</Text>
              </VStack>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}
