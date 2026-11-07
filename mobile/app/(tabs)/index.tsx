import React, { useCallback, useEffect, useState } from 'react'
import { Image, Pressable, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useTheme } from '@/contexts/ThemeContext'
import { api, ApiError, call, unwrap } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { classTitle, describeClass, hhmm, shortDate, type ClassOccurrence } from '@/lib/schedule'

type Today = components['schemas']['TodayResponse']

/** While Home is open, refetch so "Now" and "Next" move on as classes start and end. */
const REFRESH_MS = 60_000

const badgeStyle = {
  normal: { box: '', text: '' },
  cancelled: { box: 'bg-error-100', text: 'text-error-700' },
  changed: { box: 'bg-warning-100', text: 'text-warning-800' },
}

function StatusBadge({ c }: { c: ClassOccurrence }) {
  const { badge, tone } = describeClass(c)
  return badge ? (
    <Box className={`self-start rounded-full px-2 py-0.5 mt-1 ${badgeStyle[tone].box}`}>
      <Text className={`text-xs font-bold ${badgeStyle[tone].text}`}>{badge}</Text>
    </Box>
  ) : null
}

/** The big "Now" / "Next" card. */
function HighlightCard({ c, title, colors }: { c: ClassOccurrence; title: string; colors: [string, string] }) {
  const { detail } = describeClass(c)
  return (
    <VStack className="mb-6" accessible accessibilityLabel={`${title}: ${classTitle(c)}, ${hhmm(c.start)} to ${hhmm(c.end)}${c.room ? `, ${c.room}` : ''}`}>
      <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 px-1">{title}</Text>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 16 }}>
        <Text className="text-white text-xl font-bold" numberOfLines={2}>
          {classTitle(c)}
        </Text>
        <Text className="text-white/90 mt-2 font-semibold">
          {hhmm(c.start)} – {hhmm(c.end)}
          {c.room ? ` · ${c.room}` : ''}
        </Text>
        {c.teacher ? <Text className="text-white/80 mt-1">{c.teacher}</Text> : null}
        {detail ? <Text className="text-white mt-2">{detail}</Text> : null}
      </LinearGradient>
    </VStack>
  )
}

function ClassRow({ c, isLast, highlight }: { c: ClassOccurrence; isLast: boolean; highlight: boolean }) {
  const { detail, struck } = describeClass(c)
  return (
    <HStack
      className={`items-start py-4 ${isLast ? '' : 'border-b border-outline-100 dark:border-outline-800'}`}
      accessible
      accessibilityLabel={`${classTitle(c)}, ${hhmm(c.start)} to ${hhmm(c.end)}. ${describeClass(c).badge ?? ''} ${detail ?? ''}`}
    >
      <VStack className="w-16 mr-3 pt-0.5">
        <Text className={`font-bold text-sm text-typography-900 ${struck ? 'line-through text-typography-400' : ''}`}>{hhmm(c.start)}</Text>
        <Text className="text-typography-400 text-xs">{hhmm(c.end)}</Text>
      </VStack>
      <VStack className="flex-1">
        <Text className={`font-semibold text-base ${highlight ? 'text-primary-600 dark:text-primary-400' : 'text-typography-900'} ${struck ? 'line-through' : ''}`}>
          {classTitle(c)}
        </Text>
        <Text className="text-typography-500 text-xs">
          {[c.room, c.teacher].filter(Boolean).join(' · ') || c.kind}
        </Text>
        <StatusBadge c={c} />
        {detail ? <Text className="text-typography-600 text-sm mt-1">{detail}</Text> : null}
      </VStack>
    </HStack>
  )
}

/** "My day" (UX review decision 2): only my classes, with every change already applied by the server. */
export default function HomeScreen() {
  const { currentMode } = useTheme()
  const [today, setToday] = useState<Today>()
  const [problem, setProblem] = useState<ApiError>()
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setToday(await call(async () => unwrap(await api.GET('/api/v1/me/today'))))
      setProblem(undefined)
    } catch (error) {
      setProblem(error as ApiError)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
      const timer = setInterval(load, REFRESH_MS)
      return () => clearInterval(timer)
    }, [load])
  )

  useEffect(() => {
    void load()
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (!today && !problem) {
    return (
      <Box className="flex-1 justify-center items-center bg-white dark:bg-background-950">
        <Spinner size="large" accessibilityLabel="Loading your classes" />
      </Box>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentMode === 'dark' ? '#fff' : '#000'} />}
      >
        <VStack className="mb-6">
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Today
          </Heading>
          {today ? <Text className="text-typography-500 font-medium text-sm mt-1">{shortDate(today.date)}</Text> : null}
        </VStack>

        {problem ? (
          <VStack className="rounded-2xl border border-error-300 bg-error-50 p-4 mb-6" space="sm">
            <Text className="text-typography-900 font-semibold">Couldn&apos;t load your classes</Text>
            <Text className="text-typography-700">{problem.message}</Text>
            <Pressable onPress={onRefresh} accessibilityRole="button" className="min-h-[44px] justify-center">
              <Text className="text-primary-600 font-semibold">Try again</Text>
            </Pressable>
          </VStack>
        ) : null}

        {today?.scope === 'none' ? (
          <VStack className="rounded-2xl border border-outline-200 p-6 items-center" space="sm">
            <Heading size="md" className="text-typography-900 text-center">
              No classes linked to your account yet
            </Heading>
            <Text className="text-typography-500 text-center">
              Your department hasn&apos;t put you in a section. Once they do, your classes appear here.
            </Text>
          </VStack>
        ) : today ? (
          <>
            {today.current ? <HighlightCard c={today.current} title="Now" colors={['#2563EB', '#60A5FA']} /> : null}
            {today.next ? (
              <HighlightCard c={today.next} title="Next" colors={today.current ? ['#059669', '#34D399'] : ['#2563EB', '#60A5FA']} />
            ) : null}

            {today.classes.length === 0 ? (
              <Box className="mb-6 rounded-2xl overflow-hidden border border-outline-100 dark:border-outline-800">
                <Image source={require('../../assets/images/no-classes.png')} style={{ width: '100%', height: 200 }} resizeMode="cover" accessibilityLabel="" />
                <VStack className="p-6 items-center" space="sm">
                  <Heading size="md" className="text-typography-900 text-center">
                    No classes today
                  </Heading>
                  <Text className="text-typography-500 text-center">Enjoy the break.</Text>
                </VStack>
              </Box>
            ) : (
              <VStack className="mt-2">
                <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 px-1">All of today</Text>
                <VStack className="bg-white dark:bg-background-900 rounded-2xl px-4 border border-outline-100 dark:border-outline-800">
                  {today.classes.map((c, i) => (
                    <ClassRow
                      key={`${c.routineId}-${c.date}-${c.status}`}
                      c={c}
                      isLast={i === today.classes.length - 1}
                      highlight={c.routineId === today.current?.routineId && c.status === today.current?.status}
                    />
                  ))}
                </VStack>
              </VStack>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
