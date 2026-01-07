import React from 'react'
import { ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Icon } from '@/components/ui/icon'
import { Divider } from '@/components/ui/divider'
import { useAuth } from '@/contexts/Auth'
import { useTheme } from '@/contexts/ThemeContext'

const AccountScreen = () => {
  const { currentMode, setTheme } = useTheme()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const toggleTheme = (value: boolean) => {
    setTheme(value ? 'dark' : 'light')
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <VStack className="px-4 py-4">
        <Heading size="2xl" className="font-extrabold text-typography-900">
          Account
        </Heading>
      </VStack>

      <ScrollView className="flex-1">
        <VStack className="mt-4 px-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 pl-1">
            General
          </Text>

          <Box className="bg-white dark:bg-background-900 rounded-xl overflow-hidden shadow-sm">
            <Pressable
              onPress={() => router.push('/profile')}
              className="p-4 active:bg-background-50 dark:active:bg-background-800"
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center space-x-3 gap-3">
                  <Icon
                    as={Ionicons}
                    name="person-outline"
                    size={16}
                    className="text-typography-900"
                  />
                  <Text className="text-base font-medium text-typography-900">
                    Profile
                  </Text>
                </HStack>
                <Icon
                  as={Ionicons}
                  name="chevron-forward"
                  size={20}
                  className="text-typography-400"
                />
              </HStack>
            </Pressable>

            <Divider className="bg-outline-100 dark:bg-outline-800" />

            <Box className="p-4">
              <HStack className="items-center justify-between">
                <HStack className="items-center space-x-3 gap-3">
                  <Icon
                    as={Ionicons}
                    name={currentMode === 'dark' ? 'moon' : 'moon-outline'}
                    size={16}
                    className="text-typography-900"
                  />
                  <Text className="text-base font-medium text-typography-900">
                    Dark Mode
                  </Text>
                </HStack>
                <Switch
                  value={currentMode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={currentMode === 'dark' ? '#f5dd4b' : '#f4f3f4'}
                />
              </HStack>
            </Box>

            <Divider className="bg-outline-100 dark:bg-outline-800" />

            <Pressable
              onPress={handleLogout}
              className="p-4 active:bg-error-50 dark:active:bg-error-900/10"
            >
              <HStack className="items-center justify-center space-x-2 gap-2">
                <Icon
                  as={Ionicons}
                  name="power"
                  size={20}
                  style={{ color: '#DC2626' }}
                />
                <Text className="text-base font-bold text-error-600">
                  Logout
                </Text>
              </HStack>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AccountScreen
