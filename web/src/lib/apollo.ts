import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import axios from 'axios'
import Cookies from 'js-cookie'
import { isJwtExpired } from '@/lib/jwt'

let cachedToken: string | null = null
let tokenPromise: Promise<string> | null = null

const getGuestToken = async (): Promise<string> => {
  if (cachedToken && !isJwtExpired(cachedToken)) {
    return cachedToken
  }
  cachedToken = null

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

// Signed-in users must query Hasura with their own token: the guest role has
// no access to dashboard tables. Fall back to a guest token only when there is
// no usable user token (e.g. public pages, or the access token has expired).
const getUserToken = (): string | null => {
  if (typeof window === 'undefined') return null
  const token = Cookies.get('access_token')
  return token && !isJwtExpired(token) ? token : null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authLink = new SetContextLink(async (_prevContext, _operation) => {
  try {
    const token = getUserToken() ?? (await getGuestToken())

    return {
      headers: {
        'x-hasura-access-token': token,
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
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
