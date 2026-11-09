import React, { useCallback, useEffect, useState } from 'react'
import { Image, Pressable, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useTheme } from '@/contexts/ThemeContext'
import { api, ApiError, call, unwrap } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { classTitle, describeClass, hhmm, shortDate, type ClassOccurrence } from '@/lib/schedule'
import { ClassRow } from '@/components/classes/ClassRow'
import { ClassActionsSheet } from '@/components/classes/ClassActionsSheet'
import { ConfirmationBanner } from '@/components/classes/ConfirmationBanner'

type Today = components['schemas']['TodayResponse']

/** While Home is open, refetch so "Now" and "Next" move on as classes start and end. */
const REFRESH_MS = 60_000

/**
 * The big "Now" / "Next" card: a flat, solid brand fill, not a gradient —
 * on a near-black canvas a gradient reads as decoration this system doesn't
 * allow itself (see the design system's README).
 */
function HighlightCard({
  c,
  title,
  color,
  onColor,
}: {
  c: ClassOccurrence
  title: string
  /** The fill — solid brand or accent, never a gradient. */
  color: string
  /** The one contrasting text color for that fill (tokens.json "on-brand"/"on-danger" pattern): dark text on the pale dark-theme accent, white text on the deeper light-theme one. */
  onColor: string
}) {
  const { detail } = describeClass(c)
  return (
    <VStack className="mb-6" accessible accessibilityLabel={`${title}: ${classTitle(c)}, ${hhmm(c.start)} to ${hhmm(c.end)}${c.room ? `, ${c.room}` : ''}`}>
      <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 px-1">{title}</Text>
      <Box style={{ borderRadius: 8, padding: 12, backgroundColor: color }}>
        <Text style={{ color: onColor }} className="text-xl font-bold" numberOfLines={2}>
          {classTitle(c)}
        </Text>
        <Text style={{ color: onColor, opacity: 0.9 }} className="mt-2 font-semibold">
          {hhmm(c.start)} – {hhmm(c.end)}
          {c.room ? ` · ${c.room}` : ''}
        </Text>
        {c.teacher ? <Text style={{ color: onColor, opacity: 0.8 }} className="mt-1">{c.teacher}</Text> : null}
        {detail ? <Text style={{ color: onColor }} className="mt-2">{detail}</Text> : null}
      </Box>
    </VStack>
  )
}

/** "My day" (UX review decision 2): only my classes, with every change already applied by the server. */
export default function HomeScreen() {
  const { currentMode } = useTheme()
  const isDark = currentMode === 'dark'
  // tokens.json brand/accent, each theme's own hex (not the same shade in
  // both — the dark-theme accent is pale, so it needs dark "on-brand" text).
  const BRAND = isDark ? '#7B88E8' : '#4850B8'
  const ACCENT = isDark ? '#A78BFA' : '#6D28D9'
  const ON_FILL = isDark ? '#0A0A0B' : '#FFFFFF'
  const [today, setToday] = useState<Today>()
  const [problem, setProblem] = useState<ApiError>()
  const [refreshing, setRefreshing] = useState(false)
  const [changing, setChanging] = useState<ClassOccurrence | null>(null)
  const [confirmation, setConfirmation] = useState<string>()
  const hideConfirmation = useCallback(() => setConfirmation(undefined), [])

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

  const onChanged = async (message: string) => {
    setChanging(null)
    setConfirmation(message)
    await load()
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
          <VStack className="rounded-lg border border-error-300 bg-error-50 p-4 mb-6" space="sm">
            <Text className="text-typography-900 font-semibold">Couldn&apos;t load your classes</Text>
            <Text className="text-typography-700">{problem.message}</Text>
            <Pressable onPress={onRefresh} accessibilityRole="button" className="min-h-[44px] justify-center">
              <Text className="text-primary-600 font-semibold">Try again</Text>
            </Pressable>
          </VStack>
        ) : null}

        {today?.scope === 'none' ? (
          <VStack className="rounded-lg border border-outline-200 p-6 items-center" space="sm">
            <Heading size="md" className="text-typography-900 text-center">
              No classes linked to your account yet
            </Heading>
            <Text className="text-typography-500 text-center">
              Your department hasn&apos;t put you in a section. Once they do, your classes appear here.
            </Text>
          </VStack>
        ) : today ? (
          <>
            {today.current ? (
              <HighlightCard c={today.current} title="Now" color={BRAND} onColor={ON_FILL} />
            ) : null}
            {today.next ? (
              <HighlightCard
                c={today.next}
                title="Next"
                color={today.current ? ACCENT : BRAND}
                onColor={ON_FILL}
              />
            ) : null}

            {today.classes.length === 0 ? (
              <Box className="mb-6 rounded-lg overflow-hidden border border-outline-100 dark:border-outline-800">
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
                {today.canChange ? (
                  <Text className="text-typography-500 text-sm mb-2 px-1">Tap a class to cancel it, move it or change its room.</Text>
                ) : null}
                <VStack className="bg-white dark:bg-background-900 rounded-lg px-4 border border-outline-100 dark:border-outline-800">
                  {today.classes.map((c, i) => (
                    <ClassRow
                      key={`${c.routineId}-${c.date}-${c.status}`}
                      c={c}
                      isLast={i === today.classes.length - 1}
                      highlight={c.routineId === today.current?.routineId && c.status === today.current?.status}
                      onPress={today.canChange ? () => setChanging(c) : undefined}
                    />
                  ))}
                </VStack>
              </VStack>
            )}
          </>
        ) : null}
      </ScrollView>
      <ConfirmationBanner message={confirmation} onHide={hideConfirmation} />
      <ClassActionsSheet cls={changing} onClose={() => setChanging(null)} onChanged={onChanged} />
    </SafeAreaView>
  )
}
