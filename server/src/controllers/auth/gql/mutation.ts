export const CREATE_SESSION = `
  mutation InsertSession($session: user_session_insert_input!) {
    insert_user_session_one(object: $session) {
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

export const UPDATE_SESSION = `
  mutation UpdateSession($id: uuid!, $session: user_session_set_input!) {
    update_user_session_by_pk(pk_columns: { id: $id }, _set: $session) {
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
