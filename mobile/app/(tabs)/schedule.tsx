import React, { useCallback, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react-native'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { ClassRow } from '@/components/classes/ClassRow'
import { ClassActionsSheet } from '@/components/classes/ClassActionsSheet'
import { ConfirmationBanner } from '@/components/classes/ConfirmationBanner'
import { Notice } from '@/components/signin/Fields'
import { useTheme } from '@/contexts/ThemeContext'
import { api, ApiError, call, unwrap } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { addDays, dayChip, shortDate, type ClassOccurrence } from '@/lib/schedule'

type Week = components['schemas']['WeekResponse']

/**
 * Seven days of my classes from GET /me/week, with every change applied by the
 * server, starting today. Teachers and CRs can tap a class to change it.
 */
export default function ScheduleScreen() {
  const { currentMode } = useTheme()
  // undefined = "from today" (the server's campus date decides what today is).
  const [start, setStart] = useState<string>()
  const [week, setWeek] = useState<Week>()
  const [selected, setSelected] = useState(0)
  const [problem, setProblem] = useState<ApiError>()
  const [refreshing, setRefreshing] = useState(false)
  const [changing, setChanging] = useState<ClassOccurrence | null>(null)
  const [confirmation, setConfirmation] = useState<string>()
  const hideConfirmation = useCallback(() => setConfirmation(undefined), [])

  const load = useCallback(async (from?: string) => {
    try {
      const data = await call(async () =>
        unwrap(await api.GET('/api/v1/me/week', { params: { query: from ? { start: from } : {} } }))
      )
      setWeek(data)
      setProblem(undefined)
    } catch (error) {
      setProblem(error as ApiError)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load(start)
    }, [load, start])
  )

  const goTo = (from: string | undefined) => {
    setStart(from)
    setSelected(0)
    setWeek(undefined)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await load(start)
    setRefreshing(false)
  }

  const onChanged = async (message: string) => {
    setChanging(null)
    setConfirmation(message)
    await load(start)
  }

  const day = week?.days[selected]
  const happening = (classes: ClassOccurrence[]) => classes.filter((c) => c.status !== 'cancelled' && c.status !== 'moved_away').length

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950" edges={['top']}>
      <VStack className="px-4 pt-4 pb-2">
        <HStack className="items-center justify-between mb-3">
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Schedule
          </Heading>
          <HStack space="xs" className="items-center">
            <Pressable
              onPress={() => week && goTo(addDays(week.from, -7))}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              className="p-2 min-h-[44px] justify-center"
            >
              <Icon as={ChevronLeft} size={22} className="text-typography-700" />
            </Pressable>
            {start ? (
              <Pressable onPress={() => goTo(undefined)} accessibilityRole="button" className="px-2 min-h-[44px] justify-center">
                <Text className="text-primary-600 font-semibold">Today</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => week && goTo(addDays(week.from, 7))}
              accessibilityRole="button"
              accessibilityLabel="Next week"
              className="p-2 min-h-[44px] justify-center"
            >
              <Icon as={ChevronRight} size={22} className="text-typography-700" />
            </Pressable>
          </HStack>
        </HStack>

        {week ? (
          <Text className="text-typography-500 text-sm mb-3">
            {shortDate(week.from)} – {shortDate(week.to)}
          </Text>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="sm">
            {(week?.days ?? []).map((d, i) => {
              const chip = dayChip(d.date)
              const isSelected = i === selected
              const count = happening(d.classes)
              return (
                <Pressable
                  key={d.date}
                  onPress={() => setSelected(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${shortDate(d.date)}, ${count} ${count === 1 ? 'class' : 'classes'}`}
                  className={`items-center rounded-2xl px-3 py-2 min-w-[52px] border ${
                    isSelected ? 'bg-primary-500 border-primary-500' : 'border-outline-200 dark:border-outline-800'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-typography-500'}`}>{chip.weekday}</Text>
                  <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-typography-900'}`}>{chip.day}</Text>
                  <View className={`h-1.5 w-1.5 rounded-full mt-0.5 ${count ? (isSelected ? 'bg-white' : 'bg-primary-500') : 'bg-transparent'}`} />
                </Pressable>
              )
            })}
          </HStack>
        </ScrollView>
      </VStack>

      {!week && !problem ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" accessibilityLabel="Loading your week" />
        </Box>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentMode === 'dark' ? '#fff' : '#000'} />}
        >
          {problem ? (
            <View className="mb-4">
              <Notice message={problem.message} action={{ label: 'Try again', onPress: onRefresh }} />
            </View>
          ) : null}

          {week?.scope === 'none' ? (
            <VStack className="rounded-2xl border border-outline-200 p-6 items-center" space="sm">
              <Heading size="md" className="text-typography-900 text-center">
                No classes linked to your account yet
              </Heading>
              <Text className="text-typography-500 text-center">
                Your department hasn&apos;t put you in a section. Once they do, your classes appear here.
              </Text>
            </VStack>
          ) : day ? (
            <VStack>
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 px-1">{shortDate(day.date)}</Text>
              {day.classes.length === 0 ? (
                <VStack className="rounded-2xl border border-outline-100 dark:border-outline-800 p-6 items-center" space="xs">
                  <Icon as={Coffee} size={28} className="text-typography-400" />
                  <Text className="text-typography-700 font-semibold">No classes</Text>
                </VStack>
              ) : (
                <>
                  {week?.canChange ? (
                    <Text className="text-typography-500 text-sm mb-2 px-1">Tap a class to cancel it, move it or change its room.</Text>
                  ) : null}
                  <VStack className="bg-white dark:bg-background-900 rounded-2xl px-4 border border-outline-100 dark:border-outline-800">
                    {day.classes.map((c, i) => (
                      <ClassRow
                        key={`${c.routineId}-${c.date}-${c.status}`}
                        c={c}
                        isLast={i === day.classes.length - 1}
                        onPress={week?.canChange ? () => setChanging(c) : undefined}
                      />
                    ))}
                  </VStack>
                </>
              )}
            </VStack>
          ) : null}
        </ScrollView>
      )}
      <ConfirmationBanner message={confirmation} onHide={hideConfirmation} />
      <ClassActionsSheet cls={changing} onClose={() => setChanging(null)} onChanged={onChanged} />
    </SafeAreaView>
  )
}
