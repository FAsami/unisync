import React, { useState, useMemo, useEffect } from 'react'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { RefreshControl, ScrollView, Image } from 'react-native'
import { useQuery } from '@apollo/client'
import {
  GET_EVENT_ROUTINES,
  GetEventRoutinesData,
  EventRoutine,
} from '@/lib/graphql-operations'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, getDay } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/contexts/Auth'
import { Clock } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Spinner } from '@/components/ui/spinner'
import { Badge, BadgeText } from '@/components/ui/badge'
import { useTheme } from '@/contexts/ThemeContext'
import { Icon } from '@/components/ui/icon'

const ClassCard = ({
  item,
  title,
  backgroundColor,
  accentColor,
}: {
  item: EventRoutine
  title: string
  backgroundColor: string
  accentColor: string
}) => {
  const formattedStartTime = item.start_time
    ? item.start_time.substring(0, 5)
    : 'N/A'
  const formattedEndTime = item.end_time ? item.end_time.substring(0, 5) : 'N/A'

  return (
    <Box className="mb-6 rounded-xl overflow-hidden">
      <HStack className="justify-between items-center mb-3 px-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-typography-500">
          {title}
        </Text>
      </HStack>

      <LinearGradient
        colors={[backgroundColor, accentColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 16 }}
      >
        <VStack space="md">
          <HStack className="justify-between items-start">
            <VStack className="flex-1">
              <Text
                className="text-white text-lg font-bold mb-1"
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <HStack className="flex-wrap gap-2 mt-2">
                <Box className="bg-white/20 px-2 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-bold uppercase">
                    {item.event_type}
                  </Text>
                </Box>

                {item.course_offering?.section && (
                  <Box className="bg-white/20 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      {item.course_offering.section.batch?.name
                        ? `Batch ${item.course_offering.section.batch.name} • `
                        : ''}
                      Section {item.course_offering.section.name}
                    </Text>
                  </Box>
                )}
              </HStack>
            </VStack>
          </HStack>

          <Box className="border-t border-white/20 pt-4 mt-2">
            <HStack className="items-center space-x-2">
              <Icon as={Clock} size="sm" className="text-white" />
              <Text className="text-white font-bold text-lg">
                &nbsp; {formattedStartTime} - {formattedEndTime}
              </Text>
            </HStack>
          </Box>

          {item.course_offering?.course && (
            <Text className="text-white/80 text-xs mt-1">
              {item.course_offering.course.code} •{' '}
              {item.course_offering.course.name}
            </Text>
          )}

          {item.course_offering?.faculty && (
            <Text className="text-white/70 text-xs mt-1">
              Instructor: {item.course_offering.faculty.first_name}{' '}
              {item.course_offering.faculty.last_name}
            </Text>
          )}
        </VStack>
      </LinearGradient>
    </Box>
  )
}

const HomeScreen = () => {
  const { currentMode } = useTheme()
  const { userId } = useAuth()
  const { loading, error, data, refetch } = useQuery<GetEventRoutinesData>(
    GET_EVENT_ROUTINES,
    {
      variables: { userId },
      skip: !userId,
    }
  )
  const [now, setNow] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const { currentClass, nextClass, allClassesToday } = useMemo(() => {
    if (!data?.event_routine)
      return { currentClass: null, nextClass: null, allClassesToday: [] }

    const currentDayOfWeek = getDay(now)
    const currentTimeStr = format(now, 'HH:mm:ss')

    const todaysRoutines = data.event_routine
      .filter((r) => r.day_of_week === currentDayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

    let current = null
    let next = null

    for (const routine of todaysRoutines) {
      if (
        routine.start_time <= currentTimeStr &&
        routine.end_time >= currentTimeStr
      ) {
        current = routine
      } else if (routine.start_time > currentTimeStr) {
        if (!next) next = routine
      }
    }

    return {
      currentClass: current,
      nextClass: next,
      allClassesToday: todaysRoutines,
    }
  }, [data, now])

  if (loading && !data) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-0 dark:bg-background-950">
        <Spinner size="large" />
      </Box>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
        <Box className="flex-1 justify-center items-center p-4">
          <Box className="w-full mb-6 relative items-center">
            <Image
              source={require('../../assets/images/generic-error.png')}
              style={{ width: 280, height: 280 }}
              resizeMode="contain"
              accessibilityLabel="Error illustration"
            />
          </Box>
          <Animated.View
            entering={FadeInDown.delay(200).springify().damping(12)}
            className="items-center w-full"
          >
            <Heading
              size="md"
              className="text-center font-bold tracking-wider uppercase text-typography-900 mb-3"
            >
              SOMETHING WENT WRONG
            </Heading>
            <Text className="text-center text-lg text-typography-500 px-6 mb-8">
              Oops! We hit a snag while loading your routine. unexpected glitch
              in the matrix.
            </Text>
          </Animated.View>
        </Box>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={currentMode === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        <HStack className="justify-between items-start mb-6">
          <VStack>
            <Heading size="xl" className="font-extrabold text-typography-900">
              Today
            </Heading>
            <HStack className="items-center space-x-2 mt-1">
              <Text className="text-typography-500 font-medium text-sm">
                {format(now, 'EEEE, MMMM do')}
              </Text>
              <Box className="w-1 h-1 rounded-full bg-typography-300" />
              <Text className="text-primary-500 font-bold text-sm">
                {format(now, 'h:mm:ss a')}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {currentClass ? (
          <ClassCard
            item={currentClass}
            title="Current Class"
            backgroundColor="#2563EB"
            accentColor="#60A5FA"
          />
        ) : null}

        {nextClass ? (
          <ClassCard
            item={nextClass}
            title="Next Class"
            backgroundColor={currentClass ? '#059669' : '#2563EB'}
            accentColor={currentClass ? '#34D399' : '#60A5FA'}
          />
        ) : (
          !currentClass && (
            <Box className="mb-6">
              <LinearGradient
                colors={
                  currentMode === 'dark'
                    ? ['#1e293b', '#0f172a']
                    : ['#f8fafc', '#f1f5f9']
                }
                style={{
                  borderRadius: 16,
                  padding: 0,
                  minHeight: 200,
                  borderWidth: 1,
                  borderColor: currentMode === 'dark' ? '#334155' : '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <Box className="w-full">
                  <Image
                    source={require('../../assets/images/no-classes.png')}
                    style={{ width: '100%', height: 220 }}
                    resizeMode="cover"
                    accessibilityLabel="No classes illustration"
                  />
                </Box>
                <Animated.View
                  entering={FadeInDown.delay(200).springify().damping(9)}
                  className="py-12 items-center w-full"
                >
                  <Heading
                    size="md"
                    className="text-center font-bold tracking-wider uppercase text-typography-900 mb-3"
                  >
                    YOU'RE OFF THE HOOK
                  </Heading>
                  <Text className="text-center text-lg text-typography-500 px-6">
                    Time to recharge! Grab a coffee ☕️, catch up on sleep 😴,
                    or just chill. You've earned this break.
                  </Text>
                </Animated.View>
              </LinearGradient>
            </Box>
          )
        )}

        {allClassesToday.length > 0 && (
          <VStack className="mt-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-4 px-1">
              Full Schedule
            </Text>

            <VStack className="bg-white dark:bg-background-900 rounded-2xl p-4 border border-outline-100 dark:border-outline-800">
              {allClassesToday.map((routine, index) => {
                const isCurrent = currentClass?.id === routine.id
                const isNext = nextClass?.id === routine.id
                const isLast = index === allClassesToday.length - 1

                return (
                  <HStack
                    key={routine.id}
                    className={`items-start py-4 ${
                      !isLast
                        ? 'border-b border-outline-100 dark:border-outline-800'
                        : ''
                    }`}
                  >
                    <VStack className="w-16 mr-3 pt-0.5">
                      <Text className="font-bold text-typography-900 text-sm">
                        {routine.start_time.substring(0, 5)}
                      </Text>
                      <Text className="text-typography-400 text-xs">
                        {routine.end_time.substring(0, 5)}
                      </Text>
                    </VStack>

                    <VStack className="flex-1">
                      <HStack className="justify-between items-start">
                        <VStack className="flex-1 pr-2">
                          <Text
                            className={`font-semibold text-base mb-0.5 ${
                              isCurrent
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-typography-900'
                            }`}
                          >
                            {routine.name}
                          </Text>
                          <Text className="text-typography-500 text-xs">
                            {routine.course_offering?.section?.name} •{' '}
                            {routine.event_type}
                          </Text>
                          {routine.course_offering?.faculty && (
                            <Text className="text-typography-400 text-xs mt-0.5">
                              {routine.course_offering.faculty.first_name}{' '}
                              {routine.course_offering.faculty.last_name}
                            </Text>
                          )}
                        </VStack>

                        {(isCurrent || isNext) && (
                          <Badge
                            size="sm"
                            variant="solid"
                            action={isCurrent ? 'info' : 'success'}
                            className="rounded-md"
                          >
                            <BadgeText>{isCurrent ? 'NOW' : 'NEXT'}</BadgeText>
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                )
              })}
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen
