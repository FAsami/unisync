import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from '@/components/ui/avatar'
import { Box } from '@/components/ui/box'
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Notice } from '@/components/signin/Fields'
import { useAuth } from '@/contexts/Auth'
import { api, ApiError, call, session, unwrap } from '@/lib/api'
import { roleLabel } from '@/lib/roles'

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <HStack className="items-center py-2" accessible accessibilityLabel={`${label}: ${value}`}>
      <Box className="w-10 h-10 rounded-full bg-background-50 dark:bg-background-800 items-center justify-center mr-4">
        <Icon as={Ionicons} name={icon} size="sm" className="text-typography-600" />
      </Box>
      <VStack className="flex-1">
        <Text className="text-xs text-typography-500 mb-0.5">{label}</Text>
        <Text className="text-base font-medium text-typography-900">{value}</Text>
      </VStack>
    </HStack>
  )
}

/**
 * Who I am (GET /me). The roster details belong to the department, so they
 * are read-only here. Deleting the account (DELETE /me) is the in-app deletion
 * the stores require: it signs out everywhere and stops pushes.
 */
export default function ProfileScreen() {
  const { me, refreshMe, userRole } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [problem, setProblem] = useState<ApiError>()
  const [tried, setTried] = useState(false)

  const reload = useCallback(() => {
    setTried(false)
    void refreshMe().finally(() => setTried(true))
  }, [refreshMe])

  useEffect(reload, [reload])

  const deleteAccount = async () => {
    setDeleting(true)
    setProblem(undefined)
    try {
      await call(async () => unwrap(await api.DELETE('/api/v1/me')))
      // The server already revoked every session; this clears the phone's copy.
      await session.signOut()
      router.replace('/login')
    } catch (error) {
      setProblem(error as ApiError)
      setDeleting(false)
    }
  }

  const name = me ? [me.firstName, me.lastName].filter(Boolean).join(' ') : ''

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="items-center px-2 py-2">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" className="p-3">
          <Icon as={Ionicons} name="arrow-back" size={22} className="text-typography-900" />
        </Pressable>
        <Heading size="md" className="text-typography-900">
          Profile
        </Heading>
      </HStack>

      {!me && tried ? (
        <View className="px-4">
          <Notice message="Couldn't load your profile. Check your connection and try again." action={{ label: 'Try again', onPress: reload }} />
        </View>
      ) : !me ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" accessibilityLabel="Loading your profile" />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <VStack className="items-center my-4">
            <Avatar size="2xl" className="bg-primary-500 mb-4 items-center justify-center">
              <Icon as={Ionicons} name="person" size={45} className="text-white" />
            </Avatar>
            <Heading size="xl" className="font-bold text-typography-900 mb-1 text-center">
              {name || me.phone}
            </Heading>
            <Text className="text-sm text-typography-500">{roleLabel(me.role ?? userRole, me.isClassRepresentative)}</Text>
          </VStack>

          <Box className="bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800 mt-4">
            <VStack space="sm">
              <InfoRow icon="call-outline" label="Phone" value={me.phone} />
              {me.studentId ? (
                <>
                  <Divider className="bg-outline-100 dark:bg-outline-800" />
                  <InfoRow icon="card-outline" label="Student ID" value={me.studentId} />
                </>
              ) : null}
              {me.section ? (
                <>
                  <Divider className="bg-outline-100 dark:bg-outline-800" />
                  <InfoRow icon="people-outline" label="Section" value={`Section ${me.section.name}`} />
                </>
              ) : null}
            </VStack>
          </Box>
          <Text className="text-typography-500 text-sm mt-3 px-1">Something wrong here? Your department keeps these details; ask them to fix it.</Text>

          <Box className="bg-white dark:bg-background-900 rounded-xl p-4 border border-error-200 dark:border-error-800 mt-8">
            <Text className="text-base font-semibold text-typography-900">Delete account</Text>
            <Text className="text-sm text-typography-500 mt-1 mb-4">
              You&apos;ll be signed out on every device, stop getting notifications, and won&apos;t be able to sign in again. Your
              department keeps its roster record.
            </Text>
            {problem ? (
              <View className="mb-3">
                <Notice message={problem.message} />
              </View>
            ) : null}
            {confirming ? (
              <VStack space="sm">
                <Text className="text-typography-900 font-semibold">Delete your account now?</Text>
                <Button onPress={deleteAccount} isDisabled={deleting} className="bg-error-600 rounded-full h-12">
                  {deleting ? <ButtonSpinner color="#fff" className="mr-2" /> : null}
                  <ButtonText className="text-white font-bold">Yes, delete my account</ButtonText>
                </Button>
                <Button onPress={() => setConfirming(false)} isDisabled={deleting} variant="outline" className="rounded-full h-12">
                  <ButtonText className="font-semibold">Keep my account</ButtonText>
                </Button>
              </VStack>
            ) : (
              <Button onPress={() => setConfirming(true)} variant="outline" className="rounded-full h-12 border-error-500">
                <ButtonText className="text-error-600 font-semibold">Delete my account</ButtonText>
              </Button>
            )}
          </Box>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
