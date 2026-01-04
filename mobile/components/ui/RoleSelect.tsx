import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

type Role = 'student' | 'teacher' | 'cr' | 'admin'

interface RoleSelectProps {
  value: Role
  onChange: (role: Role) => void
}

const roles: { value: Role; label: string; icon: string; color: string }[] = [
  { value: 'student', label: 'Student', icon: 'person', color: '#F59E0B' }, // Warning-500
  { value: 'cr', label: 'CR', icon: 'star', color: '#10B981' }, // Success-500
  { value: 'teacher', label: 'Teacher', icon: 'school', color: '#8B5CF6' }, // Tertiary-500
  {
    value: 'admin',
    label: 'Admin',
    icon: 'shield-checkmark',
    color: '#3B82F6',
  }, // Info-500
]

export const RoleSelect = ({ value, onChange }: RoleSelectProps) => {
  const { currentMode } = useTheme()
  const haptics = useHaptics()

  return (
    <View className="flex-row flex-wrap gap-3">
      {roles.map((role) => {
        const isSelected = value === role.value

        return (
          <TouchableOpacity
            key={role.value}
            onPress={() => {
              if (value !== role.value) {
                haptics.selection()
                onChange(role.value)
              }
            }}
            className={`flex-row items-center px-4 py-3 rounded-xl border ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-900 border-primary-500'
                : 'bg-white dark:bg-background-50 border-outline-200'
            }`}
          >
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                isSelected
                  ? 'bg-white dark:bg-primary-800'
                  : 'bg-background-100 dark:bg-background-100'
              }`}
            >
              <Ionicons
                name={role.icon as any}
                size={16}
                color={isSelected ? role.color : '#94A3B8'}
              />
            </View>
            <Text
              className={`font-medium ${
                isSelected
                  ? 'text-primary-900 dark:text-primary-100'
                  : 'text-typography-600 dark:text-typography-400'
              }`}
            >
              {role.label}
            </Text>
            {isSelected && (
              <View className="ml-3 bg-primary-500 rounded-full w-2 h-2" />
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
