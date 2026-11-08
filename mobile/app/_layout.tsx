import codePush from '@revopush/react-native-code-push'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native'

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans'

import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useColorScheme } from '@/hooks/useColorScheme'
import { AuthProvider, useAuth } from '@/contexts/Auth'
import { FCMProvider } from '@/contexts/FCM'
import { AlertProvider } from '@/contexts/AlertContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import '@/global.css'

const ONBOARDING_KEY = '@onboarding_completed'

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments()
  const router = useRouter()
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY)
        setOnboardingChecked(true)

        if (!completed && segments[0] !== 'onboarding') {
          router.replace('/onboarding')
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setOnboardingChecked(true)
      }
    }

    checkOnboarding()
  }, [])

  if (!onboardingChecked) {
    return null
  }

  return <>{children}</>
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { hasValidToken, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'verify-otp' ||
      segments[0] === 'request-access'

    const inOnboarding = segments[0] === 'onboarding'

    const timeoutId = setTimeout(() => {
      if (!hasValidToken && !inAuthGroup && !inOnboarding) {
        router.replace('/login')
      } else if (hasValidToken && inAuthGroup) {
        router.replace('/(tabs)')
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [hasValidToken, segments, isLoading, router])

  if (isLoading) {
    return null
  }

  const inAuthGroup =
    segments[0] === 'login' ||
    segments[0] === 'verify-otp' ||
    segments[0] === 'request-access'

  const inOnboarding = segments[0] === 'onboarding'

  if (!hasValidToken && !inAuthGroup && !inOnboarding) {
    return null
  }

  return <>{children}</>
}

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  if (!loaded) {
    return null
  }

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GluestackUIProvider mode="system">
          <AuthProvider>
            <FCMProvider>
              <AlertProvider>
                <NavThemeProvider value={navigationTheme}>
                  <OnboardingGuard>
                    <AuthGuard>
                      <Stack>
                        <Stack.Screen
                          name="onboarding"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="login"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="verify-otp"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="request-access"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="profile"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="notification/[id]"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="manage/notifications/compose"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="manage/notifications/history"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                    </AuthGuard>
                  </OnboardingGuard>
                  <StatusBar style="auto" />
                </NavThemeProvider>
              </AlertProvider>
            </FCMProvider>
          </AuthProvider>
        </GluestackUIProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
export default codePush ? codePush(RootLayout) : RootLayout
