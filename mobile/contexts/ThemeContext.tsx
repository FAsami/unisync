import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View } from 'react-native'
import { cssInterop } from 'nativewind'

// Define context type
type ThemeContextType = {
  theme: 'light' | 'dark' | 'system'
  currentMode: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'unisync_theme_preference'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system')
  const [mounted, setMounted] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme as 'light' | 'dark' | 'system')
      }
      setMounted(true)
    })
  }, [])

  // Calculate current mode based on theme setting and system preference
  const currentMode =
    theme === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : theme

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme)
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  if (!mounted) {
    return null // or a loading splash
  }

  return (
    <ThemeContext.Provider value={{ theme, currentMode, setTheme }}>
      <View style={{ flex: 1 }} className={currentMode}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
