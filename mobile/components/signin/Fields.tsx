import React from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { Text } from '@/components/ui/text'

/** Placeholders must look different from typed text, or fields read as pre-filled. */
const PLACEHOLDER = '#9CA3AF'

const inputClass =
  'flex-1 text-base text-typography-900 dark:text-typography-0 py-3 px-3'
const boxClass = (error?: string) =>
  `flex-row items-center rounded-xl border bg-background-0 dark:bg-background-900 ${
    error ? 'border-error-500' : 'border-outline-200'
  }`

export function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text className="text-error-600 text-sm mt-1" accessibilityLiveRegion="polite">
      {message}
    </Text>
  ) : null
}

export function Label({ children }: { children: string }) {
  return <Text className="text-typography-700 font-semibold mb-1">{children}</Text>
}

/**
 * Bangladeshi mobile number with a fixed "+880" prefix: the user types only
 * the local part (01712345678 or 1712345678 both work).
 */
export function PhoneField({
  value,
  onChange,
  error,
  onSubmit,
  editable = true,
}: {
  value: string
  onChange: (text: string) => void
  error?: string
  onSubmit?: () => void
  editable?: boolean
}) {
  return (
    <View>
      <Label>Mobile number</Label>
      <View className={boxClass(error)}>
        <Text className="pl-3 text-base text-typography-500">+880</Text>
        <TextInput
          className={inputClass}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^\d\s-]/g, ''))}
          placeholderTextColor={PLACEHOLDER}
          placeholder="1712 345678"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={13}
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          editable={editable}
          accessibilityLabel="Mobile number, after plus eight eight zero"
        />
      </View>
      <FieldError message={error} />
    </View>
  )
}

/** One-time code: filled from the SMS where the OS supports it, submits itself when complete. */
export function CodeField({
  value,
  onChange,
  length,
  error,
  onComplete,
}: {
  value: string
  onChange: (text: string) => void
  length: number
  error?: string
  onComplete?: (code: string) => void
}) {
  return (
    <View>
      <Label>Code from the SMS</Label>
      <View className={boxClass(error)}>
        <TextInput
          className={`${inputClass} text-center text-2xl tracking-[8px]`}
          value={value}
          onChangeText={(t) => {
            const digits = t.replace(/\D/g, '').slice(0, length)
            onChange(digits)
            if (digits.length === length) onComplete?.(digits)
          }}
          placeholderTextColor={PLACEHOLDER}
          placeholder={'•'.repeat(length)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          autoFocus
          accessibilityLabel={`${length}-digit code from the SMS`}
        />
      </View>
      <FieldError message={error} />
    </View>
  )
}

export function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
  autoCapitalize = 'words',
}: {
  label: string
  value: string
  onChange: (text: string) => void
  error?: string
  placeholder?: string
  autoCapitalize?: 'none' | 'words' | 'characters'
}) {
  return (
    <View>
      <Label>{label}</Label>
      <View className={boxClass(error)}>
        <TextInput
          className={inputClass}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={PLACEHOLDER}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          accessibilityLabel={label}
        />
      </View>
      <FieldError message={error} />
    </View>
  )
}

/** A tappable field that opens a picker. */
export function PickerField({
  label,
  value,
  placeholder,
  onPress,
  error,
  disabled,
}: {
  label: string
  value?: string
  placeholder: string
  onPress: () => void
  error?: string
  disabled?: boolean
}) {
  return (
    <View>
      <Label>{label}</Label>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`${boxClass(error)} min-h-[48px] px-3 ${disabled ? 'opacity-50' : ''}`}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
        accessibilityState={{ disabled }}
      >
        <Text className={value ? 'text-base text-typography-900' : 'text-base text-typography-400'}>
          {value ?? placeholder}
        </Text>
      </Pressable>
      <FieldError message={error} />
    </View>
  )
}

/** A message box for errors that aren't about one field, with an optional action. */
export function Notice({
  message,
  tone = 'error',
  action,
}: {
  message: string
  tone?: 'error' | 'info' | 'success'
  action?: { label: string; onPress: () => void }
}) {
  const colors = {
    error: 'bg-error-50 border-error-300',
    info: 'bg-info-50 border-info-300',
    success: 'bg-success-50 border-success-300',
  }[tone]
  return (
    <View className={`rounded-xl border p-4 ${colors}`} accessibilityLiveRegion="polite">
      <Text className="text-typography-800">{message}</Text>
      {action ? (
        <Pressable onPress={action.onPress} accessibilityRole="button" className="mt-3 min-h-[44px] justify-center">
          <Text className="text-primary-600 font-semibold">{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
