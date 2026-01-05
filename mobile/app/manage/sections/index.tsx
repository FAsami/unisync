import React, { useState, useMemo } from 'react'
import {
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { GET_ALL_SECTIONS, GET_USER_SECTION } from '@/lib/graphql-operations'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'

import { SearchBar } from '@/components/ui/SearchBar'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'
import { useAuth } from '@/contexts/Auth'
import { ROLES } from '@/constants/Permissions'

const SectionsScreen = () => {
  const { currentMode } = useTheme()
  const haptics = useHaptics()
  const { user, userRole } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')

  const { loading, error, data, refetch } = useQuery(GET_ALL_SECTIONS)

  // Fetch user's section if they're a class representative
  const { data: userSectionData } = useQuery(GET_USER_SECTION, {
    variables: { userId: user?.id },
    skip: !user?.id || userRole !== ROLES.CLASS_REPRESENTATIVE,
  })

  const filteredData = useMemo(() => {
    if (!data?.academic_section) return []

    let sections = data.academic_section

    // If user is a class representative, only show their assigned section
    if (
      userRole === ROLES.CLASS_REPRESENTATIVE &&
      userSectionData?.user_profile?.[0]?.section_id
    ) {
      const userSectionId = userSectionData.user_profile[0].section_id
      sections = sections.filter((section: any) => section.id === userSectionId)
    }

    // Apply search filter
    return sections.filter((item: any) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batch?.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [data, searchQuery, userRole, userSectionData])

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
              Sections
            </Heading>
            <Text size="xs" className="text-typography-500">
              Manage class sections
            </Text>
          </VStack>
        </HStack>

        {userRole !== ROLES.CLASS_REPRESENTATIVE && (
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.push('/manage/sections/new')
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
        )}
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
        {/* Search */}
        <Box className="mb-2">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search sections or batches"
            className="bg-white dark:bg-background-900"
          />
        </Box>

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
          className="dark:bg-background-900 bg-white rounded-xl overflow-hidden mt-8"
        >
          {filteredData.map((section: any, index: number) => (
            <TouchableOpacity
              key={section.id}
              onPress={() => router.push(`/manage/sections/${section.id}`)}
              className={`p-4 active:bg-background-50 dark:active:bg-background-800 ${
                index !== filteredData.length - 1
                  ? 'border-b border-outline-100 dark:border-outline-800'
                  : ''
              } ${!section.is_active ? 'opacity-60' : ''}`}
            >
              <HStack className="items-center justify-between">
                <HStack className="flex-1 items-center space-x-2 mr-2">
                  <VStack>
                    <Text className="text-base text-typography-900">
                      <Text className="font-bold text-primary-600 dark:text-primary-400">
                        {section.batch?.name || 'Unknown Batch'}
                      </Text>{' '}
                      - {section.name}
                    </Text>
                    {section.batch?.department && (
                      <Text className="text-xs text-typography-500">
                        {section.batch.department.name} • Capacity:{' '}
                        {section.capacity}
                      </Text>
                    )}
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
              <Ionicons name="file-tray-full" size={48} color="#94A3B8" />
            </Box>
            <VStack className="items-center">
              <Heading size="md" className="text-typography-900">
                No Sections Found
              </Heading>
              <Text className="text-typography-500 text-center mt-2">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : 'Create a section to get started.'}
              </Text>
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default SectionsScreen
