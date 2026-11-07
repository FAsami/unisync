import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { session, type Tokens } from '@/lib/api'
import { getInstallId } from '@/lib/installId'

interface User {
  id: string
  role: string
}

interface AuthContextType {
  isLoading: boolean
  hasValidToken: boolean
  /** True after the server ended the session (signed in elsewhere, deleted, revoked). */
  isSessionRevoked: boolean
  user: User | null
  userId: string | null
  userRole: string | null
  /** Call with the tokens from /auth/verify. */
  login: (tokens: Tokens) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** React view of lib/api/session: the single source of truth for who is signed in. */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isSessionRevoked, setIsSessionRevoked] = useState(false)

  const readUser = useCallback(async () => {
    const signedIn = await session.isSignedIn()
    const claims = signedIn ? await session.claims() : null
    setUser(claims ? { id: claims.userId, role: claims.role } : null)
  }, [])

  useEffect(() => {
    readUser().finally(() => setIsLoading(false))
    return session.subscribe((event) => {
      if (event.type === 'signed-in') {
        setIsSessionRevoked(false)
        void readUser()
      } else {
        setUser(null)
        setIsSessionRevoked(event.reason === 'revoked')
      }
    })
  }, [readUser])

  const login = useCallback((tokens: Tokens) => session.signIn(tokens), [])

  // Passing the install id makes the server stop this phone's pushes in the same call.
  const logout = useCallback(async () => session.signOut(await getInstallId()), [])

  const value: AuthContextType = {
    isLoading,
    hasValidToken: !!user,
    isSessionRevoked,
    user,
    userId: user?.id ?? null,
    userRole: user?.role ?? null,
    login,
    logout,
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
