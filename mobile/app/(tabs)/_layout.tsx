import { Tabs } from 'expo-router'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HapticTab } from '@/components/HapticTab'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors, AppColors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Fonts } from '@/constants/Fonts'
import { useAuth } from '@/contexts/Auth'
import { canSend } from '@/lib/roles'

const TabLayout = () => {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const { userRole, me } = useAuth()
  // Teachers, department admins and CRs send notices; setup itself is on the web.
  const showManageTab = canSend(userRole, me?.isClassRepresentative)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 5,
          height: 70 + Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: Fonts.light,
          letterSpacing: 0,
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'SCHEDULE',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          href: showManageTab ? undefined : null,
          title: 'SEND',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'megaphone' : 'megaphone-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'ALERTS',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'ACCOUNT',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'person' : 'person-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabLayout
