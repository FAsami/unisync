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
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
} from '@/components/ui/form-control'
import { Icon } from '@/components/ui/icon'

type KeyboardType =
  | 'default'
  | 'phone-pad'
  | 'email-address'
  | 'numeric'
  | 'number-pad'

export type AuthFormFieldConfig<T extends FieldValues> = {
  name: Path<T>
  label: string
  placeholder: string
  icon: string
  keyboardType?: KeyboardType
  isPassword?: boolean
}

type AuthFormFieldProps<T extends FieldValues> = {
  field: AuthFormFieldConfig<T>
  control: Control<T>
  errors: any
  onClearError?: () => void
}

export function AuthFormField<T extends FieldValues>({
  field,
  control,
  errors,
  onClearError,
}: AuthFormFieldProps<T>) {
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
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-full border-outline-200 focus:border-primary-500 h-14 bg-transparent">
            <InputSlot className="pl-3">
              <Icon
                as={Ionicons}
                name={field.icon as any}
                size={20}
                className="text-typography-400"
              />
            </InputSlot>
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
              className="text-lg"
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
