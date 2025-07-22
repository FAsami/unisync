import { getGraphQLClient } from "../../src/lib/graphqlClient";
import { config } from "../../src/config/environment";

// Mock GraphQLClient
jest.mock("graphql-request", () => ({
  GraphQLClient: jest.fn().mockImplementation(
    (endpoint: string, options: any) =>
      ({
        endpoint,
        options,
        request: jest.fn(),
      } as any)
  ),
}));

describe("GraphQL Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGraphQLClient", () => {
    it("should create GraphQL client with correct endpoint", () => {
      const client = getGraphQLClient();

      expect(client).toBeDefined();
      expect((client as any).endpoint).toBe(config.HASURA_ENDPOINT);
    });

    it("should create GraphQL client with admin secret when available", () => {
      const client = getGraphQLClient();

      expect(client).toBeDefined();
      expect((client as any).options).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-hasura-admin-secret": expect.any(String),
          }),
        })
      );
    });

    it("should return the same client instance on multiple calls", () => {
      const client1 = getGraphQLClient();
      const client2 = getGraphQLClient();

      expect(client1).toBe(client2);
    });

    it("should have request method available", () => {
      const client = getGraphQLClient();

      expect(typeof client.request).toBe("function");
    });
  });
});
