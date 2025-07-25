import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { getGuestSessionToken, authEventEmitter } from "./auth";
import { getEnv } from "@/utils/getEnv";

const httpLink = createHttpLink({
  uri: getEnv("DATAHUB"),
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: getEnv("DATAHUB_WS"),
    connectionParams: async () => {
      const token = await getGuestSessionToken();
      return {
        headers: {
          "x-hasura-access-token": token || "",
        },
      };
    },
    on: {
      error: (error: any) => {
        if (
          error?.message?.includes("unauthorized") ||
          error?.message?.includes("401")
        ) {
          authEventEmitter.emit("AUTH_ERROR", {
            reason: "GraphQL WebSocket unauthorized",
            timestamp: new Date().toISOString(),
          });
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
      const delay = Math.min(1000 * Math.pow(2, retries), 16000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    },
  })
);

const authLink = setContext(async (_, { headers }) => {
  const token = await getGuestSessionToken();
  return {
    headers: {
      ...headers,
      "X-hasura-access-token": token || "",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        if (
          extensions?.code === "access-denied" ||
          message.includes("unauthorized")
        ) {
          authEventEmitter.emit("AUTH_ERROR", {
            reason: "GraphQL access denied",
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    if (networkError) {
      if (networkError.message.includes("401")) {
        authEventEmitter.emit("AUTH_ERROR", {
          reason: "GraphQL network 401 error",
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

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
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export const refetchQueriesOnAuthChange = () => {
  apolloClient.refetchQueries({
    include: "active",
  });
};

export const clearApolloCache = () => {
  apolloClient.clearStore();
};
