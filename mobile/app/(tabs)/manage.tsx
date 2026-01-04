import React from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Href } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { Pressable } from '@/components/ui/pressable'
import { Icon } from '@/components/ui/icon'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/Auth'
import { PermissionGate } from '@/components/manage/PermissionGate'
import { PERMISSIONS, hasPermission } from '@/constants/Permissions'

const ManagementCard = ({
  icon,
  title,
  description,
  route,
  color,
}: {
  icon: any
  title: string
  description: string
  route: Href
  color: string
}) => {
  const router = useRouter()
  return (
    <Pressable className="w-[31%] mb-3" onPress={() => router.push(route)}>
      <Card
        size="lg"
        variant="elevated"
        className="p-3 aspect-square justify-center items-center bg-white border border-outline-100 dark:bg-background-900 dark:border-outline-800"
      >
        <Box
          className="rounded-full flex items-center justify-center mb-2"
          style={{ backgroundColor: `${color}15`, padding: 8 }}
        >
          <Icon as={Ionicons} name={icon} size={24} style={{ color: color }} />
        </Box>
        <VStack space="xs" className="items-center w-full">
          <Heading
            size="xs"
            className="font-bold text-typography-900 text-center w-full"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Heading>
          <Text
            className="text-[10px] text-typography-500 text-center w-full"
            numberOfLines={2}
          >
            {description}
          </Text>
        </VStack>
      </Card>
    </Pressable>
  )
}

const ManageScreen = () => {
  const { userRole } = useAuth()

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-background-950"
      edges={['top']}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Box className="px-5 pt-6 pb-6">
          <Heading
            size="3xl"
            className="font-extrabold text-typography-900 mb-2"
          >
            Manage
          </Heading>
          <Text className="text-typography-500 text-base">
            Quick access to your tools
          </Text>
        </Box>

        <VStack space="2xl" className="px-5">
          <PermissionGate permission={PERMISSIONS.MANAGE_USERS}>
            <VStack space="md">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Administration
              </Text>
              <Box className="flex-row flex-wrap justify-between">
                <ManagementCard
                  icon="people"
                  title="Students"
                  description="Manage Students"
                  route={'/manage/students' as Href}
                  color="#10B981"
                />
                <ManagementCard
                  icon="school"
                  title="Faculty"
                  description="Manage Faculty"
                  route={'/manage/faculty' as Href}
                  color="#F59E0B"
                />
                <ManagementCard
                  icon="business"
                  title="Depts"
                  description="Departments"
                  route={'/manage/departments' as Href}
                  color="#F97316"
                />
                <ManagementCard
                  icon="people-circle"
                  title="Batches"
                  description="Student Groups"
                  route={'/manage/batches' as Href}
                  color="#10B981"
                />
                <ManagementCard
                  icon="file-tray-full"
                  title="Sections"
                  description="Class Sections"
                  route={'/manage/sections' as Href}
                  color="#8B5CF6"
                />
                <ManagementCard
                  icon="library"
                  title="Courses"
                  description="Offerings"
                  route="/manage/courses"
                  color="#6366F1"
                />
                <Box className="w-[31%]" />
              </Box>
            </VStack>
          </PermissionGate>

          {/* Teacher Features */}
          <PermissionGate permission={PERMISSIONS.MANAGE_OWN_COURSES}>
            <VStack space="md">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Teaching
              </Text>
              <Box className="flex-row flex-wrap justify-between">
                <ManagementCard
                  icon="easel"
                  title="My Courses"
                  description="Assigned classes"
                  route={'/manage/my-courses' as Href}
                  color="#F59E0B"
                />
                <ManagementCard
                  icon="medal"
                  title="Grades"
                  description="Grading"
                  route={'/manage/grades' as Href}
                  color="#6366F1"
                />
                <Box className="w-[31%]" />
              </Box>
            </VStack>
          </PermissionGate>

          {/* CR Features */}
          <PermissionGate permission={PERMISSIONS.MANAGE_SECTION_ATTENDANCE}>
            <VStack space="md">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Section
              </Text>
              <Box className="flex-row flex-wrap justify-between">
                <ManagementCard
                  icon="checkbox"
                  title="Attendance"
                  description="Track daily"
                  route={'/manage/attendance' as Href}
                  color="#059669"
                />
                <ManagementCard
                  icon="megaphone"
                  title="Notices"
                  description="Announcements"
                  route={'/manage/announcements' as Href}
                  color="#DC2626"
                />
                <Box className="w-[31%]" />
              </Box>
            </VStack>
          </PermissionGate>
          {!hasPermission(userRole, PERMISSIONS.MANAGE_USERS) &&
            !hasPermission(userRole, PERMISSIONS.MANAGE_OWN_COURSES) &&
            !hasPermission(userRole, PERMISSIONS.MANAGE_SECTION_ATTENDANCE) && (
              <VStack className="items-center justify-center py-16 bg-white dark:bg-background-900 rounded-3xl border border-outline-100 dark:border-outline-800">
                <Text className="text-6xl mb-6">🔒</Text>
                <Heading
                  size="lg"
                  className="text-center font-bold text-typography-900 mb-2"
                >
                  No Access
                </Heading>
                <Text className="text-center text-typography-500 px-8 leading-relaxed">
                  You don't have permission to manage any resources. Contact
                  your administrator.
                </Text>
              </VStack>
            )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ManageScreen
