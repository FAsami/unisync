import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Notice } from '@/components/signin/Fields'
import { api, ApiError, call, unwrap } from '@/lib/api'
import { inboxIcon, type InboxItem } from '@/lib/inbox'
import { INBOX_ICONS } from '@/lib/inboxIcons'
import { shortDate } from '@/lib/schedule'

/** One notice, opened from the inbox or from its push (data.notificationId). Opening it marks it read. */
export default function NotificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [item, setItem] = useState<InboxItem>()
  const [problem, setProblem] = useState<ApiError>()

  useEffect(() => {
    if (!id) return
    let active = true
    void (async () => {
      try {
        const found = await call(async () => unwrap(await api.GET('/api/v1/me/notifications/{id}', { params: { path: { id } } })))
        if (!active) return
        setItem(found)
        if (!found.read) {
          // Best effort: if it fails, the notice simply stays unread.
          await call(async () => unwrap(await api.POST('/api/v1/me/notifications/{id}/read', { params: { path: { id } } }))).catch(() => {})
        }
      } catch (error) {
        if (active) setProblem(error as ApiError)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/notifications'))
  const classDate = item?.data.date

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="items-center px-2 py-2">
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" className="p-3">
          <Icon as={ArrowLeft} size={22} className="text-typography-900" />
        </Pressable>
        <Heading size="md" className="text-typography-900">
          Notification
        </Heading>
      </HStack>

      {problem ? (
        <View className="px-4">
          <Notice message={problem.message} action={{ label: 'Back to notifications', onPress: back }} />
        </View>
      ) : !item ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" accessibilityLabel="Loading" />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Box className="h-12 w-12 rounded-full bg-primary-100 items-center justify-center mb-4">
            <Icon as={INBOX_ICONS[inboxIcon(item)]} size={24} className="text-primary-600" />
          </Box>
          <Heading size="xl" className="text-typography-900 mb-2">
            {item.title}
          </Heading>
          <Text className="text-typography-500 text-sm mb-6">
            {[item.from ? `From ${item.from}` : null, new Date(item.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })].filter(Boolean).join(' · ')}
          </Text>
          <Text className="text-typography-800 text-base leading-relaxed">{item.body}</Text>
          {item.kind === 'class_change' && classDate ? (
            <VStack className="mt-8 rounded-2xl border border-outline-100 dark:border-outline-800 p-4" space="sm">
              <Text className="text-typography-700">This is about your class on {shortDate(classDate)}.</Text>
              <Pressable onPress={() => router.replace('/(tabs)/schedule')} accessibilityRole="button" className="min-h-[44px] justify-center">
                <Text className="text-primary-600 font-semibold">Open my schedule</Text>
              </Pressable>
            </VStack>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
