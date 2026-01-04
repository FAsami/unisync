import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Badge, BadgeText } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar'
import { Ionicons } from '@expo/vector-icons'
import { roleColors } from '@/constants/theme'
import { useHaptics } from '@/hooks/useHaptics'

export interface User {
  id: string
  email?: string | null
  phone: string
  role: string
  is_active: boolean
  first_name?: string
  last_name?: string
}

interface UserCardProps {
  user: User
  onPressAction?: () => void
  showAction?: boolean
}

export const UserCard = ({
  user,
  onPressAction,
  showAction = true,
}: UserCardProps) => {
  const haptics = useHaptics()

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email || user.phone

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'info'
      case 'teacher':
        return 'primary'
      case 'cr':
        return 'success'
      case 'student':
        return 'success'
      default:
        return 'info'
    }
  }

  const roleVariant = getRoleColor(user.role)

  return (
    <Card
      className={`p-4 rounded-xl bg-white dark:bg-background-50 border-outline-100 dark:border-outline-200 mb-3 ${
        !user.is_active ? 'opacity-60' : ''
      }`}
    >
      <Box className="flex-row items-center">
        {/* Avatar */}
        <Avatar
          size="md"
          className={`mr-3 bg-${roleVariant}-100 dark:bg-${roleVariant}-900`}
        >
          <AvatarFallbackText
            className={`text-${roleVariant}-600 dark:text-${roleVariant}-100`}
          >
            {initials}
          </AvatarFallbackText>
        </Avatar>

        {/* User Info */}
        <Box className="flex-1">
          <Box className="flex-row items-center mb-1">
            <Text
              className="font-semibold text-typography-900 text-base mr-2"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </Box>
          <Box className="flex-row items-center flex-wrap gap-2">
            <Badge
              action={roleVariant as any}
              variant="solid"
              className="rounded-full px-2 py-0.5 h-6 opacity-90"
            >
              <BadgeText className="text-2xs font-bold uppercase">
                {user.role}
              </BadgeText>
            </Badge>

            {!user.is_active && (
              <Badge
                action="error"
                variant="outline"
                className="rounded-full px-2 py-0.5 h-6 border-error-200 bg-error-50"
              >
                <BadgeText className="text-2xs font-bold text-error-600">
                  Inactive
                </BadgeText>
              </Badge>
            )}

            {user.email && (
              <Text className="text-xs text-typography-500" numberOfLines={1}>
                {user.email}
              </Text>
            )}
          </Box>
        </Box>

        {/* Action Button */}
        {showAction && (
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              onPressAction && onPressAction()
            }}
            className="p-2 ml-1 rounded-full bg-background-50 dark:bg-background-100"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </Box>
    </Card>
  )
}
