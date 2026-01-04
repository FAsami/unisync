export const CREATE_SESSION = /* GraphQL */ `
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

export const UPDATE_SESSION = /* GraphQL */ `
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

export const INSERT_USER = /* GraphQL */ `
  mutation InsertUser($object: user_account_insert_input!) {
    insert_user_account_one(object: $object) {
      id
      phone
      email
      role
      phone_verified_at
      is_active
      created_at
      updated_at
    }
  }
`;

export const UPDATE_USER_VERIFIED = /* GraphQL */ `
  mutation UpdateUserVerified($id: uuid!) {
    update_user_account_by_pk(
      pk_columns: { id: $id }
      _set: { phone_verified_at: "now()" }
    ) {
      id
      phone_verified_at
    }
  }
`;

export const UPDATE_USER_PASSWORD = /* GraphQL */ `
  mutation UpdateUserPassword($id: uuid!, $password: String!) {
    update_user_account_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password }
    ) {
      id
    }
  }
`;

export const REVOKE_USER_SESSIONS = /* GraphQL */ `
  mutation RevokeUserSessions($user_id: uuid!) {
    update_user_session(
      where: { user_id: { _eq: $user_id }, revoked: { _eq: false } }
      _set: { revoked: true }
    ) {
      affected_rows
    }
  }
`;

export const INSERT_FACULTY_PROFILE = /* GraphQL */ `
  mutation InsertFacultyProfile($object: user_faculty_insert_input!) {
    insert_user_faculty_one(object: $object) {
      id
      user_id
    }
  }
`;

export const DELETE_USER = /* GraphQL */ `
  mutation DeleteUser($id: uuid!) {
    delete_user_account_by_pk(id: $id) {
      id
    }
  }
`;
