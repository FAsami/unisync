import React, { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

const VISIBLE_MS = 5000

/**
 * The server's confirmation after a class change ("Room changed. The section
 * has been notified."), pinned above the tab bar so it is seen wherever the
 * list is scrolled. Hides itself after a few seconds, or on tap.
 */
export function ConfirmationBanner({ message, onHide }: { message?: string; onHide: () => void }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onHide, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [message, onHide])

  if (!message) return null
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
      <Pressable
        onPress={onHide}
        accessibilityLiveRegion="polite"
        accessibilityLabel={message}
        accessibilityHint="Tap to dismiss"
        className="flex-row items-center rounded-2xl bg-success-700 px-4 py-3 shadow-md"
      >
        <Icon as={Ionicons} name="checkmark-circle" size={22} className="text-white mr-3" />
        <Text className="text-white font-semibold flex-1">{message}</Text>
      </Pressable>
    </View>
  )
}
