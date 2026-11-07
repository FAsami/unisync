import { vi, beforeEach } from "vitest";
import { fakeHasura } from "./fakeHasura";

vi.mock("../../src/lib/graphqlClient", () => {
  const request = (doc: string, vars?: Record<string, any>) =>
    fakeHasura.request(doc, vars);
  return {
    getGraphQLClient: () => ({ request }),
    resetGraphQLClient: () => {},
    gqlClient: { query: request, mutation: request, reset: () => {} },
  };
});

beforeEach(() => {
  fakeHasura.reset();
});
