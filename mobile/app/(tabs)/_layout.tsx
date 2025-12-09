import { Tabs } from 'expo-router'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HapticTab } from '@/components/HapticTab'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors, AppColors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Fonts } from '@/constants/Fonts'

const TabLayout = () => {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()

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
          letterSpacing: 0.5,
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          paddingHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={22}
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabLayout
