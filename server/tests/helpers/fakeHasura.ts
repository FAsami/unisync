/**
 * In-memory stand-in for Hasura. Every GraphQL call the server makes goes
 * through src/lib/graphqlClient, which tests replace with this fake (see
 * setup.ts). Tests register a handler per operation name and can inspect the
 * calls afterwards.
 *
 *   fakeHasura.on("GetUserByPhone", () => ({ user_account: [user] }));
 *   ...
 *   expect(fakeHasura.callsTo("InsertSession")[0].variables.session.id)...
 */
type Variables = Record<string, any>;
type Handler = (variables: Variables) => unknown | Promise<unknown>;

export interface RecordedCall {
  operation: string;
  document: string;
  variables: Variables;
}

const operationName = (document: string): string => {
  const match = document.match(/\b(?:query|mutation|subscription)\s+(\w+)/);
  if (!match) {
    throw new Error(`Anonymous GraphQL operation sent to Hasura:\n${document}`);
  }
  return match[1];
};

class FakeHasura {
  private handlers = new Map<string, Handler>();
  calls: RecordedCall[] = [];

  reset() {
    this.handlers.clear();
    this.calls = [];
  }

  on(operation: string, handler: Handler) {
    this.handlers.set(operation, handler);
    return this;
  }

  callsTo(operation: string) {
    return this.calls.filter((c) => c.operation === operation);
  }

  async request<T = any>(document: string, variables: Variables = {}): Promise<T> {
    const operation = operationName(document);
    this.calls.push({ operation, document, variables });
    const handler = this.handlers.get(operation);
    if (!handler) {
      throw new Error(
        `fakeHasura: no handler registered for operation "${operation}"`
      );
    }
    return (await handler(variables)) as T;
  }
}

export const fakeHasura = new FakeHasura();
