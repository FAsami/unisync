import messaging from '@react-native-firebase/messaging'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  return enabled
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken()
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

export function getDeviceId(): string {
  return Device.modelId || Platform.OS
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  return Platform.OS as 'ios' | 'android' | 'web'
}

export function setupTokenRefreshListener(
  onTokenRefresh: (token: string) => void
) {
  return messaging().onTokenRefresh((token) => {
    onTokenRefresh(token)
  })
}

export function setupForegroundMessageHandler(
  onMessage: (message: any) => void
) {
  return messaging().onMessage(async (remoteMessage) => {
    onMessage(remoteMessage)
  })
}
