import codePush from '@revopush/react-native-code-push'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native'
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useColorScheme } from '@/hooks/useColorScheme'
import { AuthProvider, useAuth } from '@/contexts/Auth'
import { GraphQLProvider } from '@/contexts/Apollo'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import '@/global.css'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { hasValidToken, isLoading } = useAuth()
  console.log('===>', hasValidToken, isLoading)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup =
      segments[0] === 'login' ||
      segments[0] === 'register' ||
      segments[0] === 'forgot-password' ||
      segments[0] === 'verify-otp' ||
      segments[0] === 'reset-password'

    if (!hasValidToken && !inAuthGroup) {
      router.replace('/login')
    } else if (hasValidToken && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [hasValidToken, segments, isLoading])

  if (isLoading) {
    return null
  }

  const inAuthGroup =
    segments[0] === 'login' ||
    segments[0] === 'register' ||
    segments[0] === 'forgot-password' ||
    segments[0] === 'verify-otp' ||
    segments[0] === 'reset-password'

  if (!hasValidToken && !inAuthGroup) {
    return null
  }

  return <>{children}</>
}

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
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
            <GraphQLProvider>
              <NavThemeProvider value={navigationTheme}>
                <AuthGuard>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="login"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="register"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="verify-otp"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="forgot-password"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="reset-password"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="profile"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </AuthGuard>
                <StatusBar style="auto" />
              </NavThemeProvider>
            </GraphQLProvider>
          </AuthProvider>
        </GluestackUIProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
export default codePush ? codePush(RootLayout) : RootLayout
