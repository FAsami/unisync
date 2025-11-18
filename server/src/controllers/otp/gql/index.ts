export const INSERT_OTP = `
  mutation InsertOTP($otp: user_otp_transaction_insert_input!) {
    insert_user_otp_transaction_one(object: $otp) {
      id
      identifier
      identifier_type
      purpose
      attempts
      expires_at
      verified
      created_at
    }
  }
`;

export const GET_OTP_BY_IDENTIFIER_AND_PURPOSE = `
  query GetOTPByIdentifierAndPurpose($identifier: String!, $purpose: String!) {
    user_otp_transaction(
      where: {
        identifier: { _eq: $identifier }
        purpose: { _eq: $purpose }
        verified: { _eq: false }
        expires_at: { _gt: "now()" }
      }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      identifier
      identifier_type
      purpose
      otp_hash
      attempts
      expires_at
      verified
      created_at
    }
  }
`;

export const UPDATE_OTP_ATTEMPTS = `
  mutation UpdateOTPAttempts($id: uuid!, $attempts: Int!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { attempts: $attempts }
    ) {
      id
      attempts
    }
  }
`;

export const VERIFY_OTP = `
  mutation VerifyOTP($id: uuid!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { verified: true, verified_at: "now()" }
    ) {
      id
      verified
      verified_at
    }
  }
`;

export const INVALIDATE_OLD_OTPS = `
  mutation InvalidateOldOTPs($identifier: String!, $purpose: String!) {
    update_user_otp_transaction(
      where: {
        identifier: { _eq: $identifier }
        purpose: { _eq: $purpose }
        verified: { _eq: false }
      }
      _set: { verified: true }
    ) {
      affected_rows
    }
  }
`;

export const GET_OTP_BY_ID = `
  query GetOTPById($id: uuid!) {
    user_otp_transaction_by_pk(id: $id) {
      id
      identifier
      identifier_type
      purpose
      otp_hash
      attempts
      expires_at
      verified
      created_at
    }
  }
`;

export const UPDATE_OTP = `
  mutation UpdateOTP($id: uuid!, $otp_hash: String!, $expires_at: timestamptz!, $attempts: Int!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { 
        otp_hash: $otp_hash,
        expires_at: $expires_at,
        attempts: $attempts
      }
    ) {
      id
      identifier
      identifier_type
      purpose
      attempts
      expires_at
    }
  }
`;

export const GET_SETTING = `
  query GET_SETTING($where: settings_config_bool_exp!) {
  settings_config(where: $where) {
    identifier
    scope
    value
  }
}`;
