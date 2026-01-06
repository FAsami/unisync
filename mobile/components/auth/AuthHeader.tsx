import React from 'react'
import { Image } from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

type AuthHeaderProps = {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <VStack className="items-center mb-4">
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 120, height: 120, marginBottom: 8 }}
        resizeMode="contain"
      />

      <Heading size="2xl" className="font-bold text-typography-900 text-center">
        {title}
      </Heading>
      <Text className="text-typography-500 text-center mt-2">{subtitle}</Text>
    </VStack>
  )
}
