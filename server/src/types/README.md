# Types Directory

This directory contains all centralized TypeScript type definitions for the server application.

## Structure

- **`api.types.ts`** - API response types and request/response interfaces
- **`auth.types.ts`** - Authentication, JWT, and session types
- **`otp.types.ts`** - OTP (One-Time Password) related types and rate limiting
- **`provider.types.ts`** - Provider configuration types for SMS/Email services
- **`config.types.ts`** - Application configuration type definitions
- **`generated.ts`** - Auto-generated types from GraphQL schema (via codegen)
- **`express.d.ts`** - Express type augmentations for custom properties
- **`index.ts`** - Main export file for all types

## Usage

Import types from the centralized location:

```typescript
// Good ✅
import { TokenPayload, DecodedToken } from "../types";

// Avoid ❌
// Don't define types inline in files
```

## Guidelines

1. **All type definitions should be centralized here**
2. **Use Zod schemas (in `/schemas/`) for runtime validation**
3. **Infer types from Zod schemas when possible**
4. **Keep generated types separate** (`generated.ts`)
5. **Document complex types with JSDoc comments**

## Type Organization

- Group related types together in the same file
- Export all types that are used across multiple files
- Use clear, descriptive names
- Prefer interfaces for objects that may be extended
- Use type aliases for unions, intersections, and utility types
