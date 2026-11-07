import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { session } from './api'
import { getEnv } from '@/utils/getEnv'

const httpLink = createHttpLink({
  uri: getEnv('DATAHUB'),
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: getEnv('DATAHUB_WS'),
    connectionParams: async () => {
      const token = await session.getAccessToken()
      return {
        headers: {
          'x-hasura-access-token': token || '',
        },
      }
    },
    on: {
      error: (error: any) => {
        if (
          error?.message?.includes('unauthorized') ||
          error?.message?.includes('401')
        ) {
          void session.refreshAccessToken()
        }
      },
      closed: (event) => {
        // Connection closed
      },
      connected: () => {
        // Connection established
      },
    },
    retryAttempts: 5,
    retryWait: async (retries) => {
      const delay = Math.min(1000 * Math.pow(2, retries), 16000)
      await new Promise((resolve) => setTimeout(resolve, delay))
    },
  })
)

const authLink = setContext(async (_, { headers }) => {
  const token = await session.getAccessToken()
  return {
    headers: {
      ...headers,
      'X-hasura-access-token': token || '',
    },
  }
})

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        if (
          extensions?.code === 'access-denied' ||
          message.includes('unauthorized')
        ) {
          void session.refreshAccessToken()
        }
      })
    }

    if (networkError) {
      if (networkError.message.includes('401')) {
        void session.refreshAccessToken()
      }
    }
  }
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {},
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})

export const refetchQueriesOnAuthChange = () => {
  apolloClient.refetchQueries({
    include: 'active',
  })
}

export const clearApolloCache = () => {
  apolloClient.clearStore()
}
