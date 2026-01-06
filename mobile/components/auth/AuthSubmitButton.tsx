import React from 'react'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'

type AuthSubmitButtonProps = {
  onPress: () => void
  isLoading?: boolean
  text: string
  disabled?: boolean
}

export function AuthSubmitButton({
  onPress,
  isLoading = false,
  text,
  disabled = false,
}: AuthSubmitButtonProps) {
  return (
    <Button
      onPress={onPress}
      className="w-full rounded-full h-16 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-500/30"
      isDisabled={disabled || isLoading}
    >
      {isLoading && <ButtonSpinner color="#fff" className="mr-2" />}
      <ButtonText className="font-bold text-white text-xl">{text}</ButtonText>
    </Button>
  )
}
