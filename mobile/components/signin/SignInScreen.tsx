import React, { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/** Shared frame for the sign-in screens: safe area, keyboard avoidance, scroll. */
export function SignInScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
