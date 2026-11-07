import * as SecureStore from 'expo-secure-store'
import type { TokenStorage } from './session'

/** Tokens live in the OS keychain/keystore, not in plain AsyncStorage. */
export const secureStorage: TokenStorage = {
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: (key) => SecureStore.deleteItemAsync(key),
}
