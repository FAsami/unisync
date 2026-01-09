import React, { useState } from 'react'
import { Control, FieldValues, Path } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Ionicons } from '@expo/vector-icons'
import { AlertCircle } from 'lucide-react-native'
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated'

import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Textarea, TextareaInput } from '@/components/ui/textarea'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from '@/components/ui/form-control'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

type KeyboardType =
  | 'default'
  | 'phone-pad'
  | 'email-address'
  | 'numeric'
  | 'number-pad'

export type FormFieldConfig<T extends FieldValues> = {
  name: Path<T>
  label: string
  placeholder: string
  icon?: string
  keyboardType?: KeyboardType
  isPassword?: boolean
  required?: boolean
  maxLength?: number
  minHeight?: number
}

type FormFieldProps<T extends FieldValues> = {
  field: FormFieldConfig<T>
  fieldType: 'input' | 'textarea'
  control: Control<T>
  errors: any
  onClearError?: () => void
}

export function FormField<T extends FieldValues>({
  field,
  fieldType,
  control,
  errors,
  onClearError,
}: FormFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Controller
      key={field.name}
      control={control}
      name={field.name}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormControl isInvalid={!!errors[field.name]} className="w-full">
          <FormControlLabel className="mb-1">
            <FormControlLabelText className="text-typography-600 font-medium">
              {field.label}
              {field.required && <Text className="text-error-500"> *</Text>}
            </FormControlLabelText>
          </FormControlLabel>

          {fieldType === 'input' ? (
            <Input className="rounded-xl border-outline-200 focus:border-primary-500 h-14 bg-transparent">
              {field.icon && (
                <InputSlot className="pl-3">
                  <Icon
                    as={Ionicons}
                    name={field.icon as any}
                    size={20}
                    className="text-typography-400"
                  />
                </InputSlot>
              )}
              <InputField
                placeholder={field.placeholder}
                value={value}
                onChangeText={(text) => {
                  onChange(text)
                  if (onClearError) onClearError()
                }}
                onBlur={onBlur}
                keyboardType={field.keyboardType || 'default'}
                secureTextEntry={field.isPassword && !showPassword}
                maxLength={field.maxLength}
                className="text-base"
              />
              {field.isPassword && (
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    as={Ionicons}
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    className="text-typography-400"
                  />
                </InputSlot>
              )}
            </Input>
          ) : (
            <Textarea
              className="rounded-xl border-outline-200 bg-transparent mb-8"
              style={{ minHeight: field.minHeight || 128 }}
            >
              <TextareaInput
                placeholder={field.placeholder}
                value={value}
                onChangeText={(text) => {
                  onChange(text)
                  if (onClearError) onClearError()
                }}
                onBlur={onBlur}
                maxLength={field.maxLength}
                className="text-base"
              />
            </Textarea>
          )}

          {errors[field.name] && (
            <Animated.View
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOutUp.duration(200)}
              layout={LinearTransition.springify()}
            >
              <FormControlError>
                <FormControlErrorIcon as={AlertCircle} size="xs" />
                <FormControlErrorText>
                  {errors[field.name]?.message}
                </FormControlErrorText>
              </FormControlError>
            </Animated.View>
          )}
        </FormControl>
      )}
    />
  )
}
