import React, { useState, ReactNode, useEffect } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import { TouchableOpacity } from 'react-native'
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
} from 'react-hook-form'
import { DocumentNode } from 'graphql'
import { useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { CenteredModal } from '@/components/ui/CenteredModal'

export interface AuthSelectModalConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder: string
  icon: string
  disabled?: boolean
  getValue: (items: any[]) => string
  // Modal props
  modalTitle: string
  // Static mode (backward compatible)
  items?: any[]
  loading?: boolean
  // Query mode (new feature)
  query?: {
    query: DocumentNode
    variables?: Record<string, any>
    skip?: boolean
    dataPath: string
  }
  keyExtractor: (item: any) => string
  renderItem: (item: any, isSelected: boolean) => ReactNode
  selectedItem?: any
  onValidationError?: () => void
}

interface AuthSelectModalProps<T extends FieldValues> {
  config: AuthSelectModalConfig<T>
  control: Control<T>
  setValue: UseFormSetValue<T>
}

export function AuthSelectModal<T extends FieldValues>({
  config,
  control,
  setValue,
}: AuthSelectModalProps<T>) {
  const {
    name,
    label,
    placeholder,
    icon,
    disabled,
    getValue,
    modalTitle,
    items: staticItems,
    loading: staticLoading,
    query: queryConfig,
    keyExtractor,
    renderItem,
    selectedItem,
    onValidationError,
  } = config

  const { showAlert } = useAlert()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Execute query if query config is provided
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(queryConfig?.query || ('' as any), {
    variables: queryConfig?.variables,
    skip: !queryConfig || queryConfig.skip === true,
  })

  // Handle query errors
  useEffect(() => {
    if (error && !queryConfig?.skip) {
      showAlert({
        title: 'Error Loading Data',
        description: error.message || `Failed to load ${label.toLowerCase()}.`,
        type: 'error',
      })
    }
  }, [error])

  // Determine items and loading state based on mode
  const items = queryConfig
    ? data?.[queryConfig.dataPath] ?? []
    : staticItems ?? []
  const loading = queryConfig ? queryLoading : staticLoading

  const handlePress = () => {
    if (disabled) {
      if (onValidationError) {
        onValidationError()
      }
      return
    }
    setIsModalOpen(true)
  }

  const handleSelect = (item: any) => {
    setValue(name, keyExtractor(item) as any, { shouldValidate: true })
    setIsModalOpen(false)
  }

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { value } }) => (
          <FormControl className="w-full">
            <FormControlLabel className="mb-1">
              <FormControlLabelText className="text-typography-600 font-medium">
                {label}
              </FormControlLabelText>
            </FormControlLabel>
            <TouchableOpacity
              onPress={handlePress}
              className={`flex-row items-center justify-between rounded-full border border-outline-200 h-14 px-3 ${
                disabled ? 'bg-background-50 opacity-50' : ''
              }`}
              disabled={disabled}
            >
              <HStack className="items-center flex-1">
                <Ionicons name={icon as any} size={20} color="#94A3B8" />
                <Text
                  className={`ml-2 text-sm flex-1 ${
                    value ? 'text-typography-900' : 'text-typography-400'
                  }`}
                  numberOfLines={1}
                >
                  {getValue(items)}
                </Text>
              </HStack>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </FormControl>
        )}
      />

      <CenteredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        items={items}
        loading={loading}
        onSelect={handleSelect}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        selectedItem={selectedItem}
      />
    </>
  )
}
