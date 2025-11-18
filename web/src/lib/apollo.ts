import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import axios from 'axios'

let cachedToken: string | null = null
let tokenPromise: Promise<string> | null = null

const getGuestToken = async (): Promise<string> => {
  if (cachedToken) {
    return cachedToken
  }

  if (tokenPromise) {
    return tokenPromise
  }

  tokenPromise = (async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9201/api/v1'
      const guestEndpoint = `${apiUrl}/auth/session/guest`

      const response = await axios.post(
        guestEndpoint,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (response.data.success && response.data.data?.access_token) {
        const token = response.data.data.access_token
        cachedToken = token
        return token
      } else {
        throw new Error('No access token in response')
      }
    } catch (error) {
      throw error
    } finally {
      tokenPromise = null
    }
  })()

  return tokenPromise
}

const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_HASURA_ENDPOINT ||
    'http://localhost:9203/v1/graphql',
})

const authLink = new SetContextLink(async (prevContext, operation) => {
  try {
    const token = await getGuestToken()

    return {
      headers: {
        'x-hasura-access-token': token,
      },
    }
  } catch (error) {
    return {}
  }
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})
