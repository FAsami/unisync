export const GET_USER_BY_PHONE = `
  query GetUserByPhone($phone: String!) {
    user_account(where: { phone: { _eq: $phone } }, limit: 1) {
      id
      phone
      email
      password
      role
      phone_verified_at
      is_active
      created_at
      updated_at
      deleted_at
    }
  }
`;
