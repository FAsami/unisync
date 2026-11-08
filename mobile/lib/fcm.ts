import messaging from '@react-native-firebase/messaging'
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
  onMessage: (message: unknown) => void
) {
  return messaging().onMessage(async (remoteMessage) => {
    onMessage(remoteMessage)
  })
}

/**
 * Calls onOpen with data.notificationId when the person taps a push: both when
 * it brings the app back from the background and when it launched the app.
 * Every notice the API sends carries its own id there.
 */
export function setupNotificationOpenHandler(onOpen: (notificationId: string) => void) {
  const handle = (message: { data?: Record<string, unknown> } | null) => {
    const id = message?.data?.notificationId
    if (typeof id === 'string' && id) onOpen(id)
  }
  messaging()
    .getInitialNotification()
    .then(handle)
    .catch(() => {})
  return messaging().onNotificationOpenedApp(handle)
}
