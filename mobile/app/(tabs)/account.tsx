import React from 'react'
import { ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronRight, LogOut, Moon, User } from 'lucide-react-native'
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
import { roleLabel } from '@/lib/roles'

const AccountScreen = () => {
  const { currentMode, setTheme } = useTheme()
  const { logout, me, userRole } = useAuth()
  const name = me ? [me.firstName, me.lastName].filter(Boolean).join(' ') : ''

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
        {me ? (
          <Text className="text-typography-500 mt-1">
            {name || me.phone} · {roleLabel(me.role ?? userRole, me.isClassRepresentative)}
          </Text>
        ) : null}
      </VStack>

      <ScrollView className="flex-1">
        <VStack className="mt-4 px-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-typography-500 mb-2 pl-1">
            General
          </Text>

          <Box className="bg-white dark:bg-background-900 rounded-md overflow-hidden shadow-sm">
            <Pressable
              onPress={() => router.push('/profile')}
              className="p-4 active:bg-background-50 dark:active:bg-background-800"
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center space-x-3 gap-3">
                  <Icon
                    as={User}
                    size={16}
                    className="text-typography-900"
                  />
                  <Text className="text-base font-medium text-typography-900">
                    Profile
                  </Text>
                </HStack>
                <Icon
                  as={ChevronRight}
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
                    as={Moon}
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
                  as={LogOut}
                  size={20}
                  style={{ color: '#B91C1C' }}
                />
                <Text className="text-base font-bold text-error-600">
                  Sign out
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
