# API Reference

Unisync provides a GraphQL API powered by Hasura, along with REST endpoints for specific operations like authentication.

## GraphQL API

The main API is accessible at:

```
http://localhost:8080/v1/graphql
```

### GraphQL Playground

You can explore the API interactively using the GraphQL playground:

```
http://localhost:8080/console
```

### Schema

The GraphQL schema is automatically generated based on your database tables and relationships. You can view the complete schema in the Hasura Console.

## REST API

The server provides REST endpoints for operations that don't fit the GraphQL model well:

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Health Check

```http
GET /health
```

Returns the server status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-19T00:00:00.000Z"
}
```

## Authentication

See the [Authentication Guide](/api/authentication) for detailed information on authenticating with the API.

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server error

## Examples

### Query with GraphQL

```graphql
query GetUser($id: uuid!) {
  users_by_pk(id: $id) {
    id
    email
    first_name
    last_name
    created_at
  }
}
```

### Mutation with GraphQL

```graphql
mutation UpdateUser($id: uuid!, $data: users_set_input!) {
  update_users_by_pk(pk_columns: { id: $id }, _set: $data) {
    id
    email
    first_name
    last_name
    updated_at
  }
}
```

## Client Libraries

### JavaScript/TypeScript

```bash
yarn add @apollo/client graphql
```

See the mobile app's Apollo client configuration for an example implementation.

## Next Steps

- [Authentication](/api/authentication)
