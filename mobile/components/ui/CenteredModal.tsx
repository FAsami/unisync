import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@/components/ui/modal'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Search, X, SearchX, CheckCircle2 } from 'lucide-react-native'
import {
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  View,
} from 'react-native'

interface CenteredModalProps<T> {
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
  enableSearch?: boolean
}

export function CenteredModal<T>({
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
  enableSearch = true,
}: CenteredModalProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const filteredItems = items.filter((item: any) => {
    if (!enableSearch || !searchQuery.trim()) return true
    const itemString = JSON.stringify(item).toLowerCase()
    return itemString.includes(searchQuery.toLowerCase())
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent className="max-h-[80%]">
        <ModalHeader>
          <Heading size="lg" className="text-typography-900">
            {title}
          </Heading>
          <ModalCloseButton>
            <Icon as={X} size={20} className="text-typography-400" />
          </ModalCloseButton>
        </ModalHeader>

        <View>
          {enableSearch && (
            <View className="px-0 pt-3 pb-4 border-b border-outline-50">
              <Input className="rounded-lg bg-background-25 h-12">
                <InputSlot className="pl-3">
                  <Icon as={Search} size={22} className="text-typography-400" />
                </InputSlot>
                <InputField
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  className="text-base"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <InputSlot className="pr-3">
                    <TouchableOpacity onPress={() => handleSearch('')}>
                      <Icon as={X} size={22} className="text-typography-400" />
                    </TouchableOpacity>
                  </InputSlot>
                )}
              </Input>
            </View>
          )}

          <View style={{ minHeight: 250, maxHeight: 400 }}>
            {loading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-typography-500 mt-3">Loading...</Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12 px-2">
                <Icon as={SearchX} size={48} className="text-typography-400" />
                <Text className="text-typography-500 mt-4 text-center">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : 'No items available'}
                </Text>
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
                      className={`px-2 py-3 border-b border-outline-50 dark:border-outline-900 flex-row items-center justify-between ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <View className="flex-1">
                        {renderItem(item, !!isSelected)}
                      </View>
                      {isSelected && (
                        <Icon
                          as={CheckCircle2}
                          size={24}
                          color="#10B981"
                          fill="#10B981"
                        />
                      )}
                    </TouchableOpacity>
                  )
                }}
                contentContainerStyle={{
                  paddingBottom: 10,
                }}
                keyboardDismissMode="on-drag"
              />
            )}
          </View>
        </View>
      </ModalContent>
    </Modal>
  )
}
