import React from 'react'
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form'
import { AuthFormField, type AuthFormFieldConfig } from './AuthFormField'
import { AuthSelectModal, type AuthSelectModalConfig } from './AuthSelectModal'

export type AuthFieldConfig<T extends FieldValues> =
  | ({ type: 'input' } & AuthFormFieldConfig<T>)
  | ({ type: 'select' } & AuthSelectModalConfig<T>)

interface AuthFieldRendererProps<T extends FieldValues> {
  fields: AuthFieldConfig<T>[]
  control: Control<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
  onClearError?: () => void
}

export function AuthFieldRenderer<T extends FieldValues>({
  fields,
  control,
  errors,
  setValue,
  onClearError,
}: AuthFieldRendererProps<T>) {
  return (
    <>
      {fields.map((field) => {
        if (field.type === 'input') {
          const { type, ...fieldConfig } = field
          return (
            <AuthFormField
              key={fieldConfig.name}
              field={fieldConfig}
              control={control}
              errors={errors}
              onClearError={onClearError}
            />
          )
        } else {
          const { type, ...selectConfig } = field
          return (
            <AuthSelectModal
              key={selectConfig.name}
              config={selectConfig}
              control={control}
              setValue={setValue}
            />
          )
        }
      })}
    </>
  )
}
