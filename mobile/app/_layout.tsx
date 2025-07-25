import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
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
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { PaperProvider } from 'react-native-paper'

import { useColorScheme } from '@/hooks/useColorScheme'
import { AuthProvider } from '@/contexts/Auth'
import { GraphQLProvider } from '@/contexts/Apollo'
import { lightTheme, darkTheme } from '@/constants/Theme'

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

  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <GraphQLProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </GraphQLProvider>
      </AuthProvider>
    </PaperProvider>
  )
}
export default RootLayout
