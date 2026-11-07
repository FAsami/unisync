import React, { ReactNode, useEffect } from 'react'
import { ApolloProvider } from '@apollo/client'
import {
  apolloClient,
  refetchQueriesOnAuthChange,
  clearApolloCache,
} from '@/lib/graphql'
import { useAuth } from './Auth'
import { session } from '@/lib/api'

interface GraphQLProviderProps {
  children: ReactNode
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  children,
}) => {
  const { hasValidToken, isSessionRevoked } = useAuth()

  // Signing out (by the user or the server) must not leave the previous
  // user's data in the cache.
  useEffect(
    () =>
      session.subscribe((event) => {
        if (event.type === 'signed-out') clearApolloCache()
      }),
    []
  )

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
