import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useAuth } from './Auth'
import {
  requestNotificationPermission,
  getFCMToken,
  getDeviceId,
  getPlatform,
  setupTokenRefreshListener,
  setupForegroundMessageHandler,
} from '@/lib/fcm'
import {
  UPSERT_DEVICE_TOKEN,
  DEACTIVATE_DEVICE,
} from '@/lib/graphql-operations'

interface FCMContextType {
  hasPermission: boolean
  requestPermission: () => Promise<void>
  isRegistered: boolean
}

const FCMContext = createContext<FCMContextType | undefined>(undefined)

export const FCMProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userId, hasValidToken } = useAuth()
  console.log('FCMProvider: Rendered', { userId, hasValidToken })
  const [hasPermission, setHasPermission] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const [upsertToken, { loading, error }] = useMutation(UPSERT_DEVICE_TOKEN)
  console.log('FCMProvider: upsertToken', { loading, error })
  const [deactivateToken] = useMutation(DEACTIVATE_DEVICE)

  const registerToken = async (token: string, provider: string = 'fcm') => {
    console.log('FCMProvider: registerToken called', {
      token,
      provider,
      userId,
    })
    if (!userId) return

    try {
      await upsertToken({
        variables: {
          user_id: userId,
          device_id: getDeviceId(),
          provider,
          token,
          platform: getPlatform(),
        },
      })
      console.log('FCMProvider: Token registered successfully')
      setIsRegistered(true)
    } catch (error) {
      console.error('Failed to register FCM token:', error)
    }
  }

  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setHasPermission(granted)

    if (granted && userId) {
      const token = await getFCMToken()
      if (token) {
        await registerToken(token)
      }
    }
  }

  useEffect(() => {
    console.log('FCMProvider: useEffect triggered', { hasValidToken, userId })
    if (!hasValidToken || !userId) return

    // Auto-request permission and register token after login
    const initFCM = async () => {
      console.log('FCMProvider: initFCM started')
      const granted = await requestNotificationPermission()
      console.log('FCMProvider: Permission granted?', granted)
      setHasPermission(granted)

      if (granted) {
        const token = await getFCMToken()
        console.log('FCMProvider: FCM Token retrieved', token)
        if (token) {
          await registerToken(token)
        }
      }
    }

    initFCM()

    // Listen for token refresh
    const unsubscribeTokenRefresh = setupTokenRefreshListener(registerToken)

    // Handle foreground messages
    const unsubscribeForeground = setupForegroundMessageHandler((message) => {
      console.log('Foreground message:', message)
      // You can show in-app notification here
    })

    return () => {
      unsubscribeTokenRefresh()
      unsubscribeForeground()
    }
  }, [hasValidToken, userId])

  // Deactivate token on logout
  useEffect(() => {
    if (!hasValidToken && isRegistered) {
      deactivateToken({
        variables: {
          user_id: userId,
          device_id: getDeviceId(),
          provider: 'fcm',
        },
      })
      setIsRegistered(false)
    }
  }, [hasValidToken])

  return (
    <FCMContext.Provider
      value={{ hasPermission, requestPermission, isRegistered }}
    >
      {children}
    </FCMContext.Provider>
  )
}

export const useFCM = () => {
  const context = useContext(FCMContext)
  if (!context) {
    throw new Error('useFCM must be used within FCMProvider')
  }
  return context
}
