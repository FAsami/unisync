import React from 'react'
import { View, Image, Text } from 'react-native'
import { ThemedText } from './ThemedText'
import { text } from '@/utils/typography'

interface OnboardingSlideProps {
  image: any
  title: string
  description: string
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  image,
  title,
  description,
}) => {
  return (
    <View className="flex-1 w-screen items-center justify-center px-6 py-5">
      <View className="flex-1 justify-center items-center w-full mb-5">
        <Image
          source={image}
          className="w-[300px] h-[300px] max-h-[350px] rounded-3xl overflow-hidden"
          resizeMode="contain"
        />
      </View>
      <View className="items-center justify-center pb-10">
        <Text
          className="text-center text-3xl mb-4 text-white font-bold"
          style={text.h2}
        >
          {title}
        </Text>
        <Text
          className="text-white px-5 font-semibold text-center"
          style={text.body}
        >
          {description}
        </Text>
      </View>
    </View>
  )
}
