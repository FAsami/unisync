import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'unisync.install-id'
let cached: string | null = null

/**
 * A random id created once per app install. Push tokens are registered under
 * it: Device.modelId is iOS-only and identical across same-model phones, so it
 * made every Android device collide.
 */
export const getInstallId = async (): Promise<string> => {
  if (cached) return cached
  const stored = await AsyncStorage.getItem(KEY)
  if (stored) {
    cached = stored
    return stored
  }
  const fresh = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  await AsyncStorage.setItem(KEY, fresh)
  cached = fresh
  return fresh
}
