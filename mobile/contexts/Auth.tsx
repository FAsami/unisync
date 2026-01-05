import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { AppState } from 'react-native'
import {
  getGuestSessionToken,
  isAuthenticated,
  getNetworkStatus,
  authEventEmitter,
  handleSessionRevocation,
} from '@/lib/auth'
import { clearStoredTokens } from '@/utils/token'
import { axiosClient } from '@/lib/axios'
import { getCurrentUserFromToken } from '@/utils/getUserFromToken'

interface User {
  id: string
  role: string
}

interface AuthContextType {
  isLoading: boolean
  isOnline: boolean
  hasValidToken: boolean
  isSessionRevoked: boolean
  user: User | null
  userId: string | null
  userRole: string | null
  refreshAuth: () => Promise<void>
  handleRevocation: () => Promise<void>
  logout: () => Promise<void>
  login: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [hasValidToken, setHasValidToken] = useState(false)
  const [isSessionRevoked, setIsSessionRevoked] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const checkAuthStatus = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)

      const [networkStatus, authStatus] = await Promise.all([
        getNetworkStatus(),
        isAuthenticated(),
      ])

      setIsOnline(networkStatus)
      setHasValidToken(authStatus)

      if (authStatus) {
        const userData = await getCurrentUserFromToken()
        if (userData) {
          setUser({ id: userData.id, role: userData.role })
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      setHasValidToken(false)
      setUser(null)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const refreshAuth = async () => {
    try {
      const token = await getGuestSessionToken(true)
      setHasValidToken(!!token)
      setIsSessionRevoked(false)
    } catch (error) {
      setHasValidToken(false)
    }
  }

  const handleRevocation = async () => {
    try {
      await handleSessionRevocation()
      setIsSessionRevoked(false)
      setHasValidToken(false)
      await checkAuthStatus(true)
    } catch (error) {
      // Handle silently
    }
  }

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout')
      await clearStoredTokens()
      setHasValidToken(false)
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    checkAuthStatus(true)

    const handleAppStateChange = (state: string) => {
      if (state === 'active') {
        checkAuthStatus(false)
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    const handleSessionRevokedEvent = () => {
      setIsSessionRevoked(true)
      setHasValidToken(false)
    }

    const handleSessionExpiredEvent = () => {
      setHasValidToken(false)
    }

    const handleAuthErrorEvent = () => {
      setHasValidToken(false)
    }

    authEventEmitter.on('SESSION_REVOKED', handleSessionRevokedEvent)
    authEventEmitter.on('SESSION_EXPIRED', handleSessionExpiredEvent)
    authEventEmitter.on('AUTH_ERROR', handleAuthErrorEvent)

    return () => {
      subscription.remove()
      authEventEmitter.off('SESSION_REVOKED', handleSessionRevokedEvent)
      authEventEmitter.off('SESSION_EXPIRED', handleSessionExpiredEvent)
      authEventEmitter.off('AUTH_ERROR', handleAuthErrorEvent)
    }
  }, [])

  const login = async () => {
    setIsLoading(true)
    await checkAuthStatus(true)
  }

  const value: AuthContextType = {
    isLoading,
    isOnline,
    hasValidToken,
    isSessionRevoked,
    user,
    userId: user?.id || null,
    userRole: user?.role || null,
    refreshAuth,
    handleRevocation,
    logout,
    login,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
