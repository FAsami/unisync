import { gql } from "@apollo/client";

export const GET_USER_SESSIONS = gql`
  query GetUserSessions {
    user_session {
      id
      user_id
      revoked
      ip_address
      device_info
      user_agent
      last_used_at
      created_at
      updated_at
      access_token_expires_at
      refresh_token_expires_at
    }
  }
`;

export const SUBSCRIBE_TO_SESSION_CHANGES = gql`
  subscription SubscribeToSessionChanges {
    user_session {
      id
      user_id
      revoked
      ip_address
      last_used_at
      created_at
      updated_at
    }
  }
`;

export interface UserSession {
  id: string;
  user_id?: number;
  revoked: boolean;
  ip_address: string;
  device_info?: any;
  user_agent: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  access_token_expires_at?: string;
  refresh_token_expires_at?: string;
}

export interface GetUserSessionsData {
  user_session: UserSession[];
}
