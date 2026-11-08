import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { api, call, session, unwrap, type Tokens } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { getInstallId } from '@/lib/installId'

interface User {
  id: string
  role: string
}

export type Me = components['schemas']['MeResponse']

interface AuthContextType {
  isLoading: boolean
  hasValidToken: boolean
  /** True after the server ended the session (signed in elsewhere, deleted, revoked). */
  isSessionRevoked: boolean
  user: User | null
  userId: string | null
  userRole: string | null
  /** GET /me: name, section and the CR mark. Null until loaded (or when it couldn't be). */
  me: Me | null
  refreshMe: () => Promise<void>
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
  const [me, setMe] = useState<Me | null>(null)

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

  const refreshMe = useCallback(async () => {
    try {
      setMe(await call(async () => unwrap(await api.GET('/api/v1/me'))))
    } catch {
      // Screens that need it show their own error; keep whatever we had.
    }
  }, [])

  // Load /me whenever someone signs in; forget it on sign-out.
  const userKey = user?.id
  useEffect(() => {
    if (userKey) void refreshMe()
    else setMe(null)
  }, [userKey, refreshMe])

  // Resolve only once the signed-in user is in state: callers navigate right
  // after login(), and the route guard must not see a signed-out user on the
  // way (that bounced Home → Login → Home).
  const login = useCallback(
    async (tokens: Tokens) => {
      await session.signIn(tokens)
      await readUser()
    },
    [readUser]
  )

  // Passing the install id makes the server stop this phone's pushes in the same call.
  const logout = useCallback(async () => session.signOut(await getInstallId()), [])

  const value: AuthContextType = {
    isLoading,
    hasValidToken: !!user,
    isSessionRevoked,
    user,
    userId: user?.id ?? null,
    userRole: user?.role ?? null,
    me,
    refreshMe,
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
