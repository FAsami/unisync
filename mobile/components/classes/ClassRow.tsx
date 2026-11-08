import React from 'react'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { classTitle, describeClass, hhmm, type ClassOccurrence } from '@/lib/schedule'

const badgeStyle = {
  normal: { box: '', text: '' },
  cancelled: { box: 'bg-error-100', text: 'text-error-700' },
  changed: { box: 'bg-warning-100', text: 'text-warning-800' },
}

export function StatusBadge({ c }: { c: ClassOccurrence }) {
  const { badge, tone } = describeClass(c)
  return badge ? (
    <Box className={`self-start rounded-full px-2 py-0.5 mt-1 ${badgeStyle[tone].box}`}>
      <Text className={`text-xs font-bold ${badgeStyle[tone].text}`}>{badge}</Text>
    </Box>
  ) : null
}

/**
 * One class in a list. With onPress (the person may change classes) the row
 * becomes a button that opens the class-change sheet.
 */
export function ClassRow({
  c,
  isLast,
  highlight = false,
  onPress,
}: {
  c: ClassOccurrence
  isLast: boolean
  highlight?: boolean
  onPress?: () => void
}) {
  const { badge, detail, struck } = describeClass(c)
  const label = `${classTitle(c)}, ${hhmm(c.start)} to ${hhmm(c.end)}. ${badge ?? ''} ${detail ?? ''}`
  const body = (
    <HStack className={`items-start py-4 ${isLast ? '' : 'border-b border-outline-100 dark:border-outline-800'}`}>
      <VStack className="w-16 mr-3 pt-0.5">
        <Text className={`font-bold text-sm text-typography-900 ${struck ? 'line-through text-typography-400' : ''}`}>{hhmm(c.start)}</Text>
        <Text className="text-typography-400 text-xs">{hhmm(c.end)}</Text>
      </VStack>
      <VStack className="flex-1">
        <Text
          className={`font-semibold text-base ${highlight ? 'text-primary-600 dark:text-primary-400' : 'text-typography-900'} ${struck ? 'line-through' : ''}`}
        >
          {classTitle(c)}
        </Text>
        <Text className="text-typography-500 text-xs">{[c.room, c.teacher].filter(Boolean).join(' · ') || c.kind}</Text>
        <StatusBadge c={c} />
        {detail ? <Text className="text-typography-600 text-sm mt-1">{detail}</Text> : null}
      </VStack>
      {onPress ? <Icon as={Ionicons} name="ellipsis-horizontal" size={20} className="text-typography-400 ml-2 mt-1" /> : null}
    </HStack>
  )

  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Opens options to change this class">
      {body}
    </Pressable>
  ) : (
    <Box accessible accessibilityLabel={label}>
      {body}
    </Box>
  )
}
