import React from 'react'
import { Linking, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useAuth } from '@/contexts/Auth'
import { canSend, WEB_DASHBOARD_URL } from '@/lib/roles'

function Action({ icon, title, description, onPress, color }: { icon: string; title: string; description: string; onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      className="rounded-2xl border border-outline-100 dark:border-outline-800 bg-white dark:bg-background-900 p-4 mb-3"
    >
      <HStack space="md" className="items-center">
        <Box className="h-12 w-12 rounded-full items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
          <Icon as={Ionicons} name={icon} size={24} style={{ color }} />
        </Box>
        <VStack className="flex-1">
          <Text className="text-base font-bold text-typography-900">{title}</Text>
          <Text className="text-typography-500 text-sm">{description}</Text>
        </VStack>
        <Icon as={Ionicons} name="chevron-forward" size={20} className="text-typography-400" />
      </HStack>
    </Pressable>
  )
}

/**
 * The Send tab: notices for teachers, department admins and CRs. Changing a
 * class happens on the class itself (Today or Schedule). Department setup
 * (batches, courses, roster, routine) lives on the web dashboard.
 */
export default function ManageScreen() {
  const { userRole, me } = useAuth()
  const allowed = canSend(userRole, me?.isClassRepresentative)

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <VStack className="mb-6">
          <Heading size="2xl" className="font-extrabold text-typography-900">
            Send
          </Heading>
          <Text className="text-typography-500 mt-1">Tell your students what&apos;s happening.</Text>
        </VStack>

        {allowed ? (
          <>
            <Action
              icon="megaphone-outline"
              title="Send a notice"
              description="To a section, batch or your department, as you're allowed"
              color="#2563EB"
              onPress={() => router.push('/manage/notifications/compose')}
            />
            <Action
              icon="time-outline"
              title="Sent notices"
              description="What you sent, who got it and how many read it"
              color="#059669"
              onPress={() => router.push('/manage/notifications/history')}
            />
            <VStack className="rounded-2xl bg-background-50 dark:bg-background-900 p-4 mt-3" space="xs">
              <Text className="text-typography-900 font-semibold">Cancelling or moving a class?</Text>
              <Text className="text-typography-600">Tap the class on Today or Schedule. Students are told automatically.</Text>
            </VStack>
          </>
        ) : (
          <VStack className="rounded-2xl border border-outline-200 p-6 items-center" space="sm">
            <Icon as={Ionicons} name="lock-closed-outline" size={32} className="text-typography-400" />
            <Text className="text-typography-700 text-center">Only teachers, CRs and department admins send notices.</Text>
          </VStack>
        )}

        {userRole === 'admin' ? (
          <VStack className="rounded-2xl border border-outline-200 dark:border-outline-800 p-4 mt-6" space="sm">
            <Text className="text-typography-900 font-semibold">Department setup is on the web</Text>
            <Text className="text-typography-600">
              Batches, sections, courses, teachers, the student roster, the routine and access requests are managed from the web dashboard.
            </Text>
            <Pressable onPress={() => Linking.openURL(WEB_DASHBOARD_URL)} accessibilityRole="link" className="min-h-[44px] justify-center">
              <Text className="text-primary-600 font-semibold">Open the web dashboard</Text>
            </Pressable>
          </VStack>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
