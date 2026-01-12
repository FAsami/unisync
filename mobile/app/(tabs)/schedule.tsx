import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { useQuery } from '@apollo/client'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/Auth'
import {
  GET_STUDENT,
  GET_ROUTINES_BY_SECTION,
  GetRoutinesBySectionData,
} from '@/lib/graphql-operations'
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Center } from '@/components/ui/center'
import { Spinner } from '@/components/ui/spinner'
import { Icon } from '@/components/ui/icon'

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

const ScheduleScreen = () => {
  const { currentMode } = useTheme()
  const { userId } = useAuth()
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const { data: studentData, loading: studentLoading } = useQuery(GET_STUDENT, {
    variables: { userId },
    skip: !userId,
  })

  const sectionId = studentData?.user_profile?.[0]?.section_id

  // 2. Get Routines for that Section
  const {
    data: routinesData,
    loading: routinesLoading,
    refetch,
  } = useQuery<GetRoutinesBySectionData>(GET_ROUTINES_BY_SECTION, {
    variables: { sectionId },
    skip: !sectionId,
  })

  const todaysRoutines = useMemo(() => {
    if (!routinesData?.event_routine) return []
    return routinesData.event_routine.filter(
      (r) => r.day_of_week === selectedDay
    )
  }, [routinesData, selectedDay])

  const isLoading = studentLoading || routinesLoading

  const renderClassCard = (item: any) => {
    const formattedStartTime = item.start_time
      ? item.start_time.substring(0, 5)
      : 'N/A'
    const formattedEndTime = item.end_time
      ? item.end_time.substring(0, 5)
      : 'N/A'

    // Get teacher name if available
    const teacher = item.course_offering?.account?.faculties?.[0]
    const teacherName = teacher
      ? `${teacher.first_name} ${teacher.last_name}`
      : 'TBA'

    return (
      <Box
        key={item.id}
        className="mb-4 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-800"
      >
        <HStack className="items-stretch">
          <Box className="w-2 bg-primary-500" />
          <VStack className="flex-1 p-4 space-y-2">
            <HStack className="justify-between items-start">
              <VStack className="flex-1 pr-2">
                <Text
                  className="font-bold text-lg text-typography-900"
                  numberOfLines={1}
                >
                  {item.course_offering?.course?.name || item.name}
                </Text>
                <Text className="text-secondary-600 dark:text-secondary-400 text-sm font-medium">
                  {item.course_offering?.course?.code}
                </Text>
              </VStack>
              <Box className="bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">
                <Text className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase">
                  {item.event_type}
                </Text>
              </Box>
            </HStack>

            <Box className="h-px bg-outline-100 dark:bg-outline-800 my-2" />

            <HStack className="justify-between items-center">
              <HStack className="items-center space-x-3">
                <Icon
                  as={Ionicons}
                  name="time-outline"
                  size={20}
                  className="text-typography-400"
                />
                <Text className="text-typography-600 font-medium">
                  {formattedStartTime} - {formattedEndTime}
                </Text>
              </HStack>

              <HStack className="items-center space-x-3">
                <Icon
                  as={Ionicons}
                  name="person-outline"
                  size={20}
                  className="text-typography-400"
                />
                <Text className="text-typography-600 text-sm">
                  {teacherName}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0 dark:bg-background-950">
      <VStack className="p-4 bg-white dark:bg-background-950 pb-2">
        <Heading size="xl" className="font-extrabold text-typography-900 mb-4">
          Schedule
        </Heading>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <HStack className="mb-2">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day.value
              return (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setSelectedDay(day.value)}
                  className={`px-3 py-1.5 rounded-full border mr-2 ${
                    isSelected
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-transparent border-outline-200 dark:border-outline-800'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      isSelected ? 'text-white' : 'text-typography-500'
                    }`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </HStack>
        </ScrollView>
      </VStack>

      {isLoading ? (
        <Center className="flex-1">
          <Spinner size="large" />
        </Center>
      ) : !sectionId ? (
        <Center className="flex-1 p-8">
          <Box className="bg-warning-50 dark:bg-warning-900/20 p-6 rounded-2xl items-center">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Heading
              size="md"
              className="text-center font-bold text-typography-900 mb-2"
            >
              No Section Assigned
            </Heading>
            <Text className="text-center text-typography-500">
              Please contact your department administrator to get assigned to a
              section.
            </Text>
          </Box>
        </Center>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={currentMode === 'dark' ? '#fff' : '#000'}
            />
          }
        >
          {todaysRoutines.length > 0 ? (
            todaysRoutines.map(renderClassCard)
          ) : (
            <Box className="items-center justify-center py-12 opacity-70">
              <Box className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-full mb-4">
                <Icon
                  as={Ionicons}
                  name="calendar-outline"
                  size={30}
                  className="text-primary-400"
                />
              </Box>
              <Text className="text-typography-500 font-medium text-lg">
                No classes on {DAYS.find((d) => d.value === selectedDay)?.label}
              </Text>
              <Text className="text-typography-400 text-sm mt-1">
                Enjoy your day off!
              </Text>
            </Box>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default ScheduleScreen
