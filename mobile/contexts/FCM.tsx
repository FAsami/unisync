import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './Auth'
import {
  requestNotificationPermission,
  getFCMToken,
  getPlatform,
  setupTokenRefreshListener,
  setupForegroundMessageHandler,
} from '@/lib/fcm'
import { api, call, unwrap } from '@/lib/api'
import { getInstallId } from '@/lib/installId'

interface FCMContextType {
  hasPermission: boolean
  requestPermission: () => Promise<void>
  isRegistered: boolean
}

const FCMContext = createContext<FCMContextType | undefined>(undefined)

/**
 * Registers this install's push token for the signed-in user (PUT /me/devices).
 * The server moves a token to whoever registered it last, and logout switches
 * the device off in the same call, so a phone never keeps another user's pushes.
 */
export const FCMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, hasValidToken } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  const registerToken = useCallback(async (token: string) => {
    try {
      const deviceId = await getInstallId()
      await call(async () => unwrap(await api.PUT('/api/v1/me/devices', { body: { deviceId, token, platform: getPlatform() } })))
      setIsRegistered(true)
    } catch (error) {
      console.warn('Push registration failed; will retry on the next token refresh or launch.', error)
    }
  }, [])

  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setHasPermission(granted)
    if (granted && userId) {
      const token = await getFCMToken()
      if (token) await registerToken(token)
    }
  }

  useEffect(() => {
    if (!hasValidToken || !userId) {
      setIsRegistered(false)
      return
    }

    const init = async () => {
      const granted = await requestNotificationPermission()
      setHasPermission(granted)
      if (granted) {
        const token = await getFCMToken()
        if (token) await registerToken(token)
      }
    }

    void init()
    const unsubscribeTokenRefresh = setupTokenRefreshListener(registerToken)
    const unsubscribeForeground = setupForegroundMessageHandler(() => {
      // Foreground pushes: the inbox refreshes on focus; nothing to show here yet.
    })

    return () => {
      unsubscribeTokenRefresh()
      unsubscribeForeground()
    }
  }, [hasValidToken, userId, registerToken])

  return <FCMContext.Provider value={{ hasPermission, requestPermission, isRegistered }}>{children}</FCMContext.Provider>
}

export const useFCM = () => {
  const context = useContext(FCMContext)
  if (!context) {
    throw new Error('useFCM must be used within FCMProvider')
  }
  return context
}
