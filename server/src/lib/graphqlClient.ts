import { GraphQLClient } from "graphql-request";
import { config } from "../config/environment";
import logger from "../config/logger";

let graphqlClient: GraphQLClient | null = null;

const createGraphQLClient = (): GraphQLClient => {
  if (!config.HASURA_ADMIN_SECRET || !config.HASURA_ENDPOINT) {
    throw new Error(
      "HASURA_ADMIN_SECRET and HASURA_ENDPOINT are required for GraphQL client"
    );
  }

  const client = new GraphQLClient(config.HASURA_ENDPOINT, {
    headers: {
      "x-hasura-admin-secret": config.HASURA_ADMIN_SECRET,
      "Content-Type": "application/json",
    },
  });

  return client;
};

export const getGraphQLClient = (): GraphQLClient => {
  if (!graphqlClient) {
    try {
      graphqlClient = createGraphQLClient();
      logger.info("GraphQL client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize GraphQL client:", error);
      throw error;
    }
  }
  return graphqlClient;
};

const executeQuery = async <T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> => {
  const client = getGraphQLClient();

  try {
    logger.debug("Executing GraphQL query:", { query, variables });
    const result = await client.request<T>(query, variables);
    logger.debug("GraphQL query executed successfully");
    return result;
  } catch (error) {
    logger.error("GraphQL query failed:", error);
    throw error;
  }
};

const executeMutation = async <T = any>(
  mutation: string,
  variables?: Record<string, any>
): Promise<T> => {
  const client = getGraphQLClient();

  try {
    logger.debug("Executing GraphQL mutation:", { mutation, variables });
    const result = await client.request<T>(mutation, variables);
    logger.debug("GraphQL mutation executed successfully");
    return result;
  } catch (error) {
    logger.error("GraphQL mutation failed:", error);
    throw error;
  }
};

export const resetGraphQLClient = (): void => {
  graphqlClient = null;
  logger.info("GraphQL client reset");
};

const gqlClient = {
  mutation: executeMutation,
  query: executeQuery,
  reset: resetGraphQLClient,
};

export { gqlClient };
