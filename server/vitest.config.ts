import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/helpers/setup.ts"],
    // Env is read at import time by src/config/environment.ts, so it must be
    // in place before any test file imports the app.
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
      HASURA_ENDPOINT: "http://hasura.test/v1/graphql",
      HASURA_ADMIN_SECRET: "test-admin-secret",
      SERVER_AUTH_SECRET: "test-server-secret",
      OTP_BCRYPT_ROUNDS: "4",
      LOG_FILE_ENABLED: "false",
    },
    restoreMocks: true,
  },
});
