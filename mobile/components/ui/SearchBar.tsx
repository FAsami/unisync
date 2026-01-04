import React from 'react'
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  className,
}: SearchBarProps) => {
  const { currentMode } = useTheme()
  const iconColor = currentMode === 'dark' ? '#94A3B8' : '#64748B'

  return (
    <Input
      variant="outline"
      size="md"
      className={`rounded-full border-outline-200 bg-transparent dark:border-outline-200 h-14 ${className}`}
    >
      <InputSlot className="pl-3">
        {/* Using Ionicons directly as Gluestack Icon expects SVG */}
        <Ionicons name="search" size={20} color={iconColor} />
      </InputSlot>
      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        className="text-sm font-medium text-typography-900"
      />
      {value.length > 0 && (
        <InputSlot className="pr-3" onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={iconColor} />
        </InputSlot>
      )}
    </Input>
  )
}
