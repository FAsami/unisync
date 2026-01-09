import React from 'react'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'

export interface FormSubmitButtonProps {
  onPress: () => void
  isLoading?: boolean
  text: string
  disabled?: boolean
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function FormSubmitButton({
  onPress,
  isLoading = false,
  text,
  disabled = false,
  icon,
  variant = 'primary',
  size = 'lg',
}: FormSubmitButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 shadow-secondary-500/30'
      case 'outline':
        return 'bg-transparent border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100'
      default:
        return 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-primary-500/30'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-12'
      case 'md':
        return 'h-14'
      default:
        return 'h-16'
    }
  }

  const getTextClasses = () => {
    const baseClasses = 'font-bold'
    const sizeClasses =
      size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'
    const colorClasses =
      variant === 'outline' ? 'text-primary-500' : 'text-white'
    return `${baseClasses} ${sizeClasses} ${colorClasses}`
  }

  return (
    <Button
      onPress={onPress}
      className={`w-full rounded-full ${getSizeClasses()} ${getVariantClasses()} shadow-md`}
      isDisabled={disabled || isLoading}
    >
      {isLoading && (
        <ButtonSpinner
          color={variant === 'outline' ? '#3b82f6' : '#fff'}
          className="mr-2"
        />
      )}
      {!isLoading && icon && <>{icon}</>}
      <ButtonText className={getTextClasses()}>{text}</ButtonText>
    </Button>
  )
}
