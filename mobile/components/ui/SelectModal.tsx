import React, { useState, useEffect } from 'react'
import {
  Modal,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { useTheme } from '@/contexts/ThemeContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SelectModalProps<T> {
  isOpen: boolean
  onClose: () => void
  title: string
  items: T[]
  onSelect: (item: T) => void
  loading?: boolean
  searchPlaceholder?: string
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  keyExtractor: (item: T) => string
  selectedItem?: T
  onSearchChange?: (text: string) => void
  enableSearch?: boolean
}

export function SelectModal<T>({
  isOpen,
  onClose,
  title,
  items,
  onSelect,
  loading = false,
  searchPlaceholder = 'Search...',
  renderItem,
  keyExtractor,
  selectedItem,
  onSearchChange,
  enableSearch = true,
}: SelectModalProps<T>) {
  const { currentMode } = useTheme()
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      if (onSearchChange) onSearchChange('')
    }
  }, [isOpen])

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    if (onSearchChange) {
      onSearchChange(text)
    }
  }

  // If onSearchChange is not provided, we filter locally
  const filteredItems = onSearchChange
    ? items
    : items.filter((item) => {
        if (!enableSearch) return true
        // This is a basic fallback filter, usually onSearchChange should be used for complex objects or server-side filtering
        const itemString = JSON.stringify(item).toLowerCase()
        return itemString.includes(searchQuery.toLowerCase())
      })

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{ height: '80%' }}
        >
          <View className="bg-white dark:bg-background-950 rounded-t-3xl h-full overflow-hidden">
            <HStack className="items-center justify-between px-4 py-3 border-b border-outline-100 dark:border-outline-800">
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-primary-600 dark:text-primary-400 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="font-bold text-lg text-typography-900">
                {title}
              </Text>
              <View className="w-16" />
            </HStack>

            {enableSearch && (
              <View className="p-4 border-b border-outline-100 dark:border-outline-800">
                <View className="flex-row items-center bg-background-100 dark:bg-background-900 rounded-xl px-3 h-12">
                  <Ionicons name="search" size={20} color="#94A3B8" />
                  <TextInput
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 ml-2 text-base text-typography-900 h-full"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                      <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={keyExtractor}
                renderItem={({ item }) => {
                  const isSelected =
                    selectedItem &&
                    keyExtractor(selectedItem) === keyExtractor(item)
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        onSelect(item)
                        onClose()
                      }}
                      className={`px-4 py-3 border-b border-outline-50 dark:border-outline-900 flex-row items-center justify-between ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <View className="flex-1">
                        {renderItem(item, !!isSelected)}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                      )}
                    </TouchableOpacity>
                  )
                }}
                contentContainerStyle={{
                  paddingBottom: insets.bottom + 20,
                }}
                keyboardDismissMode="on-drag"
              />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
