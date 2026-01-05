import React, { useState } from 'react'
import {
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { GET_ALL_FACULTIES_LIST } from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { SearchBar } from '@/components/ui/SearchBar'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const FacultyListScreen = () => {
  const { currentMode } = useTheme()
  const haptics = useHaptics()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, refetch, error } = useQuery(GET_ALL_FACULTIES_LIST, {
    fetchPolicy: 'cache-and-network',
  })

  const faculties = data?.user_faculty || []

  const filteredFaculties = faculties.filter((faculty: any) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      faculty.first_name.toLowerCase().includes(searchLower) ||
      faculty.last_name.toLowerCase().includes(searchLower) ||
      faculty.faculty_id.toLowerCase().includes(searchLower) ||
      faculty.user?.email?.toLowerCase().includes(searchLower)
    )
  })

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        haptics.light()
        router.push(`/manage/faculty/${item.user_id}`)
      }}
      className="bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800 px-4 py-3"
    >
      <HStack className="justify-between items-center">
        <VStack>
          <Text className="font-bold text-lg text-typography-900">
            {item.first_name} {item.last_name}
          </Text>
          <Text className="text-sm text-typography-500">
            {item.designation} • {item.department?.code}
          </Text>
          <Text className="text-xs text-typography-400 mt-1">
            ID: {item.faculty_id}
          </Text>
        </VStack>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </HStack>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <VStack className="bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800 pb-2">
        <HStack className="items-center justify-between px-4 py-3">
          <HStack className="items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full hover:bg-background-50 dark:hover:bg-background-800 mr-2"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
              />
            </TouchableOpacity>
            <Heading size="md" className="font-bold text-typography-900">
              Faculty
            </Heading>
          </HStack>

          <TouchableOpacity
            onPress={() => router.push('/manage/faculty/new')}
            className="flex-row items-center bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-full"
          >
            <Ionicons name="add" size={20} color="#8B5CF6" />
            <Text className="font-bold text-primary-600 dark:text-primary-400 ml-1">
              Add
            </Text>
          </TouchableOpacity>
        </HStack>

        {/* Search */}
        <Box className="px-4 mb-2">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search faculty..."
            className="bg-white dark:bg-background-900"
          />
        </Box>
      </VStack>

      {loading && !data ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          data={filteredFaculties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <VStack className="items-center justify-center mt-20 space-y-4">
              <Box className="bg-background-100 dark:bg-background-800 p-6 rounded-full">
                <Ionicons name="school" size={48} color="#94A3B8" />
              </Box>
              <Text className="text-typography-400 text-lg">
                No faculty found
              </Text>
            </VStack>
          }
        />
      )}
    </SafeAreaView>
  )
}

export default FacultyListScreen
