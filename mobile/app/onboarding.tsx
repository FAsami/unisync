import React, { useRef, useState } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OnboardingSlide } from '@/components/OnboardingSlide'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

const ONBOARDING_KEY = '@onboarding_completed'

const slides = [
  {
    id: '1',
    image: require('@/assets/images/onboarding-1.png'),
    title: 'Stay Connected',
    description:
      'Get instant notifications about classes, assignments, and important updates from your university.',
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding-2.png'),
    title: 'Manage Your Schedule',
    description:
      'Keep track of your class routines, exam schedules, and never miss an important event.',
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Real-time Updates',
    description:
      'Stay informed with real-time notifications about class changes, announcements, and more.',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      router.replace('/login')
    } catch (error) {
      console.error('Error saving onboarding status:', error)
      router.replace('/login')
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      completeOnboarding()
    }
  }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }).current

  return (
    <SafeAreaView className="flex-1 bg-primary-500" edges={['top', 'bottom']}>
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => (
            <OnboardingSlide
              image={item.image}
              title={item.title}
              description={item.description}
            />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          className="flex-1"
        />
      </View>

      <View className="pb-5 px-6">
        <View className="flex-row justify-center items-center mb-6">
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ]

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            })

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            })

            return (
              <Animated.View
                key={index}
                className="h-2 rounded bg-white mx-1"
                style={{
                  width: dotWidth,
                  opacity,
                }}
              />
            )
          })}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-white py-4 px-8 rounded-full items-center justify-center mb-4"
          activeOpacity={0.8}
        >
          <Text className="text-lg font-medium">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          className="py-3 items-center justify-center"
        >
          <Text className="text-base text-white font-bold">Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
