import { axiosClient } from '@/lib/axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import NetInfo from '@react-native-community/netinfo'

export const setToken = async (token: string) => {
  await AsyncStorage.setItem('iam_access_token', token)
}

export const setRefreshToken = async (token: string) => {
  await AsyncStorage.setItem('iam_refresh_token', token)
}

export const getSessionToken = async (): Promise<string | null> => {
  try {
    let accessToken = await AsyncStorage.getItem('iam_access_token')
    let refreshToken = await AsyncStorage.getItem('iam_refresh_token')

    if (accessToken && isTokenValid(accessToken)) {
      return accessToken
    }
    if (refreshToken) {
      const refreshedToken = await attemptTokenRefresh(refreshToken)
      if (refreshedToken) {
        return refreshedToken
      }
    }

    return null
  } catch (error) {
    console.log('[AUTH] Error getting token:', error)
    return null
  }
}

const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token)
    const now = Date.now() / 1000
    return decoded.exp && decoded.exp > now + 30
  } catch {
    return false
  }
}

const attemptTokenRefresh = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const isConnected = await checkNetworkConnectivity()
    if (!isConnected) {
      return null
    }

    const response = await axiosClient.post<any>('/auth/session/verify', {
      refresh_token: refreshToken,
    })

    if (response.data.success && response.data.data) {
      await Promise.all([
        AsyncStorage.setItem(
          'iam_access_token',
          response.data.data.access_token
        ),
        AsyncStorage.setItem(
          'iam_refresh_token',
          response.data.data.refresh_token
        ),
        AsyncStorage.setItem('iam_session_id', response.data.data.session_id),
      ])
      return response.data.data.access_token
    }

    return null
  } catch (error: any) {
    const errorData = error.response?.data?.error
    const errorCode = errorData?.code

    if (error.response?.status === 401) {
      if (errorCode === 'SESSION_REVOKED') {
        await clearStoredTokens()
        authEventEmitter.emit('SESSION_REVOKED', {
          reason: 'Session revoked by server',
          timestamp: new Date().toISOString(),
        })
        return null
      } else if (
        errorCode === 'SESSION_NOT_FOUND' ||
        errorCode === 'REFRESH_TOKEN_EXPIRED'
      ) {
        await clearStoredTokens()
        authEventEmitter.emit('SESSION_EXPIRED', {
          reason:
            errorCode === 'SESSION_NOT_FOUND'
              ? 'Session not found'
              : 'Refresh token expired',
          timestamp: new Date().toISOString(),
        })
        return null
      } else {
        await clearStoredTokens()
        authEventEmitter.emit('AUTH_ERROR', {
          reason: 'Unauthorized token refresh',
          timestamp: new Date().toISOString(),
        })
        return null
      }
    }

    return null
  }
}

const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch()
    return netInfo.isConnected ?? false
  } catch (error) {
    console.warn('Failed to check network connectivity:', error)
    return true
  }
}

type AuthEventType = 'SESSION_REVOKED' | 'SESSION_EXPIRED' | 'AUTH_ERROR'
type AuthEventListener = (data?: any) => void

class AuthEventEmitter {
  private listeners: Map<AuthEventType, AuthEventListener[]> = new Map()

  on(event: AuthEventType, listener: AuthEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: AuthEventType, listener: AuthEventListener) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  emit(event: AuthEventType, data?: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data))
    }
  }
}

export const authEventEmitter = new AuthEventEmitter()

export const clearStoredTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem('iam_access_token'),
    AsyncStorage.removeItem('iam_refresh_token'),
  ])
}
