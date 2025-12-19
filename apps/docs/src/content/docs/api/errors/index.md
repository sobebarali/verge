---
title: Error Handling Overview
description: Error handling patterns in Verge APIs
---

This section covers error handling patterns for tRPC, authentication, and general API errors.

## Error Architecture

Verge uses a layered error handling approach:

```
┌─────────────────────────────────────────────────┐
│                   Client                        │
│  ┌─────────────────────────────────────────┐   │
│  │         Error Display (Toast)            │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       ▲
                       │ TRPCClientError
                       │
┌─────────────────────────────────────────────────┐
│                   tRPC                          │
│  ┌─────────────────────────────────────────┐   │
│  │         TRPCError Serialization          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       ▲
                       │ throw TRPCError
                       │
┌─────────────────────────────────────────────────┐
│                  Procedures                     │
│  ┌─────────────────────────────────────────┐   │
│  │      Business Logic / Validation         │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## tRPC Errors

tRPC provides standardized error codes:

```typescript
import { TRPCError } from "@trpc/server";

throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Authentication required",
  cause: "No session",
});
```

See [Error Codes](/api/errors/error-codes/) for the complete reference.

## Client-Side Handling

### With React Query

```typescript
const { data, error, isError } = trpc.someEndpoint.useQuery();

if (isError) {
  console.error(error.message);
  // error.data.code contains the error code
}
```

### With Toast Notifications

```typescript
import { toast } from 'sonner';

try {
  await trpc.someEndpoint.query();
} catch (error) {
  toast.error(error.message);
}
```

### Global Error Handling

Configure in the tRPC client:

```typescript
// apps/web/src/utils/trpc.ts
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch: async (url, options) => {
        const response = await fetch(url, {
          ...options,
          credentials: 'include',
        });

        if (!response.ok) {
          // Handle HTTP-level errors
          toast.error('Network error');
        }

        return response;
      },
    }),
  ],
});
```

## Authentication Errors

Better-Auth returns specific error codes:

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Wrong email or password |
| `USER_NOT_FOUND` | Email not registered |
| `USER_EXISTS` | Email already registered |
| `INVALID_TOKEN` | Invalid or expired token |
| `SESSION_EXPIRED` | Session has expired |

### Handling Auth Errors

```typescript
const { error } = await authClient.signIn.email({
  email,
  password,
});

if (error) {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      setError('Invalid email or password');
      break;
    case 'USER_NOT_FOUND':
      setError('No account found with this email');
      break;
    default:
      setError('Something went wrong');
  }
}
```

## Best Practices

### 1. Use Specific Error Codes

```typescript
// Good: Specific error code
throw new TRPCError({
  code: "NOT_FOUND",
  message: "User not found",
});

// Avoid: Generic error
throw new Error("Something went wrong");
```

### 2. Include Helpful Messages

```typescript
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Email format is invalid", // User-friendly message
  cause: error,                        // Original error for debugging
});
```

### 3. Handle Errors at Boundaries

```typescript
function UserProfile() {
  const { data, error } = trpc.user.profile.useQuery();

  if (error) {
    if (error.data?.code === 'NOT_FOUND') {
      return <UserNotFound />;
    }
    return <GenericError />;
  }

  return <Profile data={data} />;
}
```

### 4. Log Errors Server-Side

```typescript
const myProcedure = publicProcedure.query(async () => {
  try {
    // operation
  } catch (error) {
    console.error('Operation failed:', error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Operation failed",
    });
  }
});
```

## Related

- [Error Codes](/api/errors/error-codes/) - Complete error code reference
- [Procedures](/api/trpc/procedures/) - Procedure error handling
