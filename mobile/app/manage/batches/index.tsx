import React, { useState, useMemo } from 'react'
import { RefreshControl, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { GET_ALL_BATCHES, GET_DEPARTMENTS } from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'

// Custom Components
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const BatchesScreen = () => {
  const { currentMode } = useTheme()
  const haptics = useHaptics()

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)

  const { data: deptData } = useQuery(GET_DEPARTMENTS)
  const { loading, error, data, refetch } = useQuery(GET_ALL_BATCHES)

  const filteredData = useMemo(() => {
    if (!data?.academic_batch) return []
    return data.academic_batch.filter((item: any) => {
      const matchesDept = selectedDeptId
        ? item.departmant_id === selectedDeptId
        : true
      return matchesDept
    })
  }, [data, selectedDeptId])

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <HStack className="items-center">
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.back()
            }}
            className="p-2 rounded-full hover:bg-background-50 dark:hover:bg-background-800 mr-2"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
            />
          </TouchableOpacity>
          <VStack>
            <Heading size="md" className="font-bold text-typography-900">
              Batches
            </Heading>
            <Text size="xs" className="text-typography-500">
              Manage student batches
            </Text>
          </VStack>
        </HStack>

        <TouchableOpacity
          onPress={() => {
            haptics.light()
            router.push('/manage/batches/new')
          }}
          className="flex-row items-center p-2 active:opacity-50"
        >
          <Ionicons
            name="add"
            size={20}
            color={currentMode === 'dark' ? '#59adff' : '#59adff'}
          />
          <Text className="text-primary-600 dark:text-primary-400 font-semibold ml-1 mr-3 text-base">
            Add
          </Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <TouchableOpacity
            onPress={() => setSelectedDeptId(null)}
            className={`mr-2 px-3 py-1 rounded-full border ${
              selectedDeptId === null
                ? 'bg-primary-500 border-primary-500'
                : 'bg-transparent border-outline-200 dark:border-outline-700'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                selectedDeptId === null
                  ? 'text-white'
                  : 'text-typography-600 dark:text-typography-400'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {deptData?.academic_department.map((dept: any) => (
            <TouchableOpacity
              key={dept.id}
              onPress={() => setSelectedDeptId(dept.id)}
              className={`mr-2 px-3 py-1 rounded-full border ${
                selectedDeptId === dept.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-transparent border-outline-200 dark:border-outline-700'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedDeptId === dept.id
                    ? 'text-white'
                    : 'text-typography-600 dark:text-typography-400'
                }`}
              >
                {dept.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error State */}
        {error && (
          <VStack className="p-10 items-center justify-center space-y-3">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-error-500 text-center">{error.message}</Text>
          </VStack>
        )}

        {/* List */}
        <VStack
          space="xs"
          className="dark:bg-background-900 bg-white rounded-xl overflow-hidden"
        >
          {filteredData.map((batch: any, index: number) => (
            <TouchableOpacity
              key={batch.id}
              onPress={() => router.push(`/manage/batches/${batch.id}`)}
              className={`p-4 active:bg-background-50 dark:active:bg-background-800 ${
                index !== filteredData.length - 1
                  ? 'border-b border-outline-100 dark:border-outline-800'
                  : ''
              } ${!batch.is_active ? 'opacity-60' : ''}`}
            >
              <HStack className="items-center justify-between">
                <HStack className="flex-1 items-center space-x-2 mr-2">
                  <VStack>
                    <Text className="text-base text-typography-900 font-medium">
                      {batch.name}
                    </Text>
                    <Text className="text-xs text-typography-500">
                      {batch.department?.code} • {batch.year} •{' '}
                      {batch.semester_count} Semesters
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="md" className="items-center">
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentMode === 'dark' ? '#94A3B8' : '#CBD5E1'}
                  />
                </HStack>
              </HStack>
            </TouchableOpacity>
          ))}
        </VStack>

        {/* Empty State */}
        {filteredData.length === 0 && !loading && (
          <VStack className="items-center justify-center py-20 space-y-4">
            <Box className="bg-background-100 dark:bg-background-800 p-6 rounded-full">
              <Ionicons name="people-circle" size={48} color="#94A3B8" />
            </Box>
            <VStack className="items-center">
              <Heading size="md" className="text-typography-900">
                No Batches Found
              </Heading>
              <Text className="text-typography-500 text-center mt-2">
                Create a batch to get started.
              </Text>
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default BatchesScreen
