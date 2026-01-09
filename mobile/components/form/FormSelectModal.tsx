import React, { useState, ReactNode } from 'react'
import { useAlert } from '@/contexts/AlertContext'
import { TouchableOpacity } from 'react-native'
import {
  Control,
  Controller,
  FieldValues,
  Path,
  UseFormSetValue,
} from 'react-hook-form'
import { DocumentNode } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { CenteredModal } from '@/components/ui/CenteredModal'
import { QueryDataFetcher } from './QueryDataFetcher'

export interface FormSelectModalConfig<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder: string
  icon?: string
  disabled?: boolean
  required?: boolean
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
  // Conditional rendering
  shouldRender?: boolean
}

interface FormSelectModalProps<T extends FieldValues> {
  config: FormSelectModalConfig<T>
  control: Control<T>
  setValue: UseFormSetValue<T>
}

export function FormSelectModal<T extends FieldValues>({
  config,
  control,
  setValue,
}: FormSelectModalProps<T>) {
  const {
    name,
    label,
    placeholder,
    icon,
    disabled,
    required,
    getValue,
    modalTitle,
    items: staticItems,
    loading: staticLoading,
    query: queryConfig,
    keyExtractor,
    renderItem,
    selectedItem,
    onValidationError,
    shouldRender = true,
  } = config

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [queryData, setQueryData] = useState<any[]>([])
  const [queryLoading, setQueryLoading] = useState(false)

  const { showAlert } = useAlert()

  const handleQueryError = (error: Error) => {
    showAlert({
      title: 'Error Loading Data',
      description: error.message || `Failed to load ${label.toLowerCase()}.`,
      type: 'error',
    })
  }

  // Determine items and loading state based on mode
  const items = queryConfig ? queryData : staticItems ?? []
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

  if (!shouldRender) {
    return null
  }

  return (
    <>
      {/* Render QueryDataFetcher only when in query mode */}
      {queryConfig && !queryConfig.skip && (
        <QueryDataFetcher
          query={queryConfig.query}
          variables={queryConfig.variables}
          skip={queryConfig.skip}
          dataPath={queryConfig.dataPath}
          label={label}
          onDataLoaded={setQueryData}
          onLoadingChange={setQueryLoading}
          onError={handleQueryError}
        />
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { value } }) => (
          <FormControl className="w-full">
            <FormControlLabel className="mb-1">
              <FormControlLabelText className="text-typography-600 font-medium">
                {label}
                {required && <Text className="text-error-500"> *</Text>}
              </FormControlLabelText>
            </FormControlLabel>
            <TouchableOpacity
              onPress={handlePress}
              className={`flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3 bg-white dark:bg-background-900 ${
                disabled ? 'bg-background-50 opacity-50' : ''
              }`}
              disabled={disabled}
            >
              <HStack className="items-center flex-1">
                {icon && (
                  <Ionicons name={icon as any} size={18} color="#94A3B8" />
                )}
                <Text
                  className={`${icon ? 'ml-2' : ''} text-base flex-1 ${
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
