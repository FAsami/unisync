import React, { ReactNode, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import {
  apolloClient,
  refetchQueriesOnAuthChange,
  clearApolloCache,
} from '@/lib/graphql'
import { useAuth } from './Auth'
import { authEventEmitter } from '@/lib/auth'

interface GraphQLProviderProps {
  children: ReactNode
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  children,
}) => {
  const { hasValidToken, isSessionRevoked } = useAuth()

  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth changed, refetching GraphQL queries')
      refetchQueriesOnAuthChange()
    }

    const handleAuthError = () => {
      console.log('Auth error, clearing GraphQL cache')
      clearApolloCache()
    }

    const handleSessionRevoked = () => {
      console.log('Session revoked, clearing GraphQL cache')
      clearApolloCache()
    }

    authEventEmitter.on('AUTH_ERROR', handleAuthError)
    authEventEmitter.on('SESSION_REVOKED', handleSessionRevoked)
    authEventEmitter.on('SESSION_EXPIRED', handleAuthError)

    return () => {
      authEventEmitter.off('AUTH_ERROR', handleAuthError)
      authEventEmitter.off('SESSION_REVOKED', handleSessionRevoked)
      authEventEmitter.off('SESSION_EXPIRED', handleAuthError)
    }
  }, [])

  useEffect(() => {
    if (hasValidToken) {
      refetchQueriesOnAuthChange()
    } else {
      console.log('No valid token, GraphQL queries will be skipped')
    }
  }, [hasValidToken])

  useEffect(() => {
    if (isSessionRevoked) {
      clearApolloCache()
    }
  }, [isSessionRevoked])

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
