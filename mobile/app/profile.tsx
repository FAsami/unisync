import React, { useState, useEffect } from 'react'
import { ScrollView, TouchableOpacity, Linking } from 'react-native'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Divider } from '@/components/ui/divider'
import { Spinner } from '@/components/ui/spinner'
import { Icon } from '@/components/ui/icon'
import { Avatar } from '@/components/ui/avatar'
import { Button, ButtonText } from '@/components/ui/button'
import { useAuth } from '@/contexts/Auth'
import { getCurrentUserFromToken } from '@/utils/getUserFromToken'
import { GET_CURRENT_USER, GetCurrentUserData } from '@/lib/graphql-operations'

const ProfileScreen = () => {
  const { logout } = useAuth()
  const [tokenData, setTokenData] = useState<{
    id: string
    role: string
  } | null>(null)

  useEffect(() => {
    const loadTokenData = async () => {
      const data = await getCurrentUserFromToken()
      setTokenData(data)
    }
    loadTokenData()
  }, [])

  const { loading, error, data } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    {
      variables: { userId: tokenData?.id },
      skip: !tokenData?.id,
    }
  )

  const user = data?.user_account_by_pk

  const handleDeleteAccount = () => {
    const DELETE_ACCOUNT_URL = 'https://www.uni-sync.site/delete-account'
    Linking.openURL(DELETE_ACCOUNT_URL)
  }

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-white dark:bg-background-950">
        <Spinner size="large" />
      </Box>
    )
  }

  if (error || !user) {
    return (
      <Box className="flex-1 justify-center items-center bg-white dark:bg-background-950 p-4">
        <Text className="text-error-500 text-center">
          {error?.message || 'User not found'}
        </Text>
      </Box>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full active:bg-background-100 dark:active:bg-background-800"
        >
          <Icon
            as={Ionicons}
            name="arrow-back"
            size="md"
            className="text-typography-900"
          />
        </TouchableOpacity>
        <Heading size="md" className="text-typography-900">
          Profile
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack className="items-center my-6">
          <Avatar
            size="2xl"
            className="bg-primary-500 mb-4 items-center justify-center"
          >
            <Icon as={Ionicons} name="person" size={45} color="white" />
          </Avatar>
          <Heading size="xl" className="font-bold text-typography-900 mb-2">
            {user.profiles?.[0]
              ? `${user.profiles[0].first_name} ${user.profiles[0].last_name}`
              : user.phone}
          </Heading>
          <Text className="text-sm text-typography-500 capitalize">
            {tokenData?.role}
          </Text>
        </VStack>

        <Box className="bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800 mt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-4">
            Account Information
          </Text>

          <VStack space="md">
            <HStack className="items-center py-2">
              <Box className="w-10 h-10 rounded-full bg-background-50 dark:bg-background-800 items-center justify-center mr-4">
                <Icon
                  as={Ionicons}
                  name="call-outline"
                  size="sm"
                  className="text-typography-600"
                />
              </Box>
              <VStack className="flex-1">
                <Text className="text-xs text-typography-500 mb-0.5">
                  Phone
                </Text>
                <Text className="text-base font-medium text-typography-900">
                  {user.phone}
                </Text>
              </VStack>
            </HStack>

            <Divider className="bg-outline-100 dark:bg-outline-800" />

            <HStack className="items-center py-2">
              <Box className="w-10 h-10 rounded-full bg-background-50 dark:bg-background-800 items-center justify-center mr-4">
                <Icon
                  as={Ionicons}
                  name="mail-outline"
                  size="sm"
                  className="text-typography-600"
                />
              </Box>
              <VStack className="flex-1">
                <Text className="text-xs text-typography-500 mb-0.5">
                  Email
                </Text>
                <Text className="text-base font-medium text-typography-900">
                  {user.email || 'Not provided'}
                </Text>
              </VStack>
            </HStack>

            <Divider className="bg-outline-100 dark:bg-outline-800" />

            <HStack className="items-center py-2">
              <Box className="w-10 h-10 rounded-full bg-background-50 dark:bg-background-800 items-center justify-center mr-4">
                <Icon
                  as={Ionicons}
                  name="calendar-outline"
                  size="sm"
                  className="text-typography-600"
                />
              </Box>
              <VStack className="flex-1">
                <Text className="text-xs text-typography-500 mb-0.5">
                  Member Since
                </Text>
                <Text className="text-base font-medium text-typography-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box className="bg-white dark:bg-background-900 rounded-xl p-4 border border-error-200 dark:border-error-800 mt-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-error-600 dark:text-error-400 mb-4">
            Danger Zone
          </Text>

          <VStack space="md">
            <VStack space="xs">
              <Text className="text-base font-semibold text-typography-900">
                Delete Account
              </Text>
              <Text className="text-sm text-typography-500 mb-3">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </Text>
              <Button
                onPress={handleDeleteAccount}
                className="bg-error-500 hover:bg-error-600 rounded-full"
              >
                <ButtonText className="text-white font-medium">
                  Delete My Account
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
