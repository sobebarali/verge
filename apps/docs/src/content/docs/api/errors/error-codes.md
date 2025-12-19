---
title: Error Codes
description: tRPC error codes reference
---

This page documents all tRPC error codes and their HTTP status equivalents.

## tRPC Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PARSE_ERROR` | 400 | Invalid JSON in request body |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `METHOD_NOT_SUPPORTED` | 405 | HTTP method not allowed |
| `TIMEOUT` | 408 | Request timeout |
| `CONFLICT` | 409 | Resource conflict |
| `PRECONDITION_FAILED` | 412 | Precondition failed |
| `PAYLOAD_TOO_LARGE` | 413 | Request body too large |
| `UNPROCESSABLE_CONTENT` | 422 | Validation failed |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `CLIENT_CLOSED_REQUEST` | 499 | Client closed connection |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `NOT_IMPLEMENTED` | 501 | Feature not implemented |

## Usage in Verge

### UNAUTHORIZED

Used when authentication is required but not provided:

```typescript
// packages/api/src/index.ts
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

**When thrown**: Calling any `protectedProcedure` without a valid session.

**Client handling**:

```typescript
try {
  await trpc.privateData.query();
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    // Redirect to login
    navigate('/login');
  }
}
```

### BAD_REQUEST

Used for invalid input data:

```typescript
const createUser = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(({ input }) => {
    // Zod validation fails → BAD_REQUEST
  });
```

**When thrown**: Input validation fails.

### NOT_FOUND

Used when a requested resource doesn't exist:

```typescript
const getUser = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const user = await User.findById(input.id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user;
  });
```

### FORBIDDEN

Used when user lacks permissions:

```typescript
const deletePost = protectedProcedure
  .input(z.object({ postId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const post = await Post.findById(input.postId);

    if (post.authorId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete your own posts",
      });
    }

    await post.delete();
  });
```

### INTERNAL_SERVER_ERROR

Used for unexpected server errors:

```typescript
const myProcedure = publicProcedure.query(async () => {
  try {
    return await someOperation();
  } catch (error) {
    console.error('Unexpected error:', error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      cause: error,
    });
  }
});
```

## Error Response Format

When an error occurs, tRPC returns:

```json
{
  "error": {
    "message": "Authentication required",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "privateData"
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `message` | Human-readable error message |
| `code` | JSON-RPC error code |
| `data.code` | tRPC error code string |
| `data.httpStatus` | HTTP status code |
| `data.path` | Procedure that threw the error |

## Client-Side Error Types

```typescript
import { TRPCClientError } from '@trpc/client';

try {
  await trpc.someEndpoint.query();
} catch (error) {
  if (error instanceof TRPCClientError) {
    console.log(error.message);         // Error message
    console.log(error.data?.code);      // "UNAUTHORIZED", "NOT_FOUND", etc.
    console.log(error.data?.httpStatus); // 401, 404, etc.
  }
}
```

## Creating Custom Error Handlers

```typescript
function handleTRPCError(error: unknown) {
  if (!(error instanceof TRPCClientError)) {
    return 'An unexpected error occurred';
  }

  switch (error.data?.code) {
    case 'UNAUTHORIZED':
      return 'Please sign in to continue';
    case 'FORBIDDEN':
      return 'You don\'t have permission to do this';
    case 'NOT_FOUND':
      return 'The requested resource was not found';
    case 'BAD_REQUEST':
      return 'Invalid request. Please check your input.';
    case 'TOO_MANY_REQUESTS':
      return 'Too many requests. Please try again later.';
    default:
      return error.message || 'Something went wrong';
  }
}
```

## Related

- [Error Handling Overview](/api/errors/) - Error patterns
- [Procedures](/api/trpc/procedures/) - Throwing errors in procedures
