import React from 'react'
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form'
import { FormField, type FormFieldConfig } from './FormField'
import { FormSelectModal, type FormSelectModalConfig } from './FormSelectModal'

export type FormConfig<T extends FieldValues> =
  | ({ type: 'input' | 'textarea' } & FormFieldConfig<T>)
  | ({ type: 'select' } & FormSelectModalConfig<T>)

interface FormFieldRendererProps<T extends FieldValues> {
  fields: FormConfig<T>[]
  control: Control<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
  onClearError?: () => void
}

export function FormFieldRenderer<T extends FieldValues>({
  fields,
  control,
  errors,
  setValue,
  onClearError,
}: FormFieldRendererProps<T>) {
  return (
    <>
      {fields.map((field) => {
        if (field.type === 'input' || field.type === 'textarea') {
          const { type, ...fieldConfig } = field
          return (
            <FormField
              key={fieldConfig.name}
              field={fieldConfig}
              fieldType={type}
              control={control}
              errors={errors}
              onClearError={onClearError}
            />
          )
        } else {
          const { type, ...selectConfig } = field
          return (
            <FormSelectModal
              key={selectConfig.name}
              config={selectConfig as FormSelectModalConfig<T>}
              control={control}
              setValue={setValue}
            />
          )
        }
      })}
    </>
  )
}
