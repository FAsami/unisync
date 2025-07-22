export * from "./mutation";

export const GET_SESSION_BY_REFRESH_TOKEN = `
  query GetSessionByRefreshToken($refresh_token: String!) {
    user_session(where: { refresh_token: { _eq: $refresh_token } }, limit: 1) {
      id
      user_id
      access_token
      access_token_expires_at
      refresh_token
      refresh_token_expires_at
      revoked
      ip_address
      device_info
      user_agent
      last_used_at
      created_at
      updated_at
    }
  }
`;
