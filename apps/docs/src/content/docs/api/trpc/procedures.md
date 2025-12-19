---
title: Procedures
description: Public and protected procedure types in tRPC
---

Verge defines two procedure types: `publicProcedure` for unauthenticated access and `protectedProcedure` for authenticated access.

## Source

**Location**: `packages/api/src/index.ts`

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

// Public: No authentication required
export const publicProcedure = t.procedure;

// Protected: Requires valid session
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
```

## Public Procedure

Use `publicProcedure` for endpoints that don't require authentication.

### Characteristics

| Property | Value |
|----------|-------|
| Authentication | Not required |
| `ctx.session` | `Session \| null` |
| Use case | Health checks, public data, auth endpoints |

### Example

```typescript
import { publicProcedure, router } from "../index";

export const appRouter = router({
  // No auth required
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),

  // Session may or may not exist
  greeting: publicProcedure.query(({ ctx }) => {
    if (ctx.session) {
      return `Hello, ${ctx.session.user.name}!`;
    }
    return "Hello, guest!";
  }),
});
```

## Protected Procedure

Use `protectedProcedure` for endpoints that require an authenticated user.

### Characteristics

| Property | Value |
|----------|-------|
| Authentication | Required |
| `ctx.session` | `Session` (non-null) |
| Error on no session | `UNAUTHORIZED` |
| Use case | User data, protected actions |

### Middleware Implementation

The protected procedure uses middleware to:

1. Check if `ctx.session` exists
2. Throw `UNAUTHORIZED` error if not
3. Narrow the `session` type to non-null

```typescript
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,  // TypeScript now knows session is non-null
    },
  });
});
```

### Example

```typescript
import { protectedProcedure, router } from "../index";

export const appRouter = router({
  // Requires authentication
  privateData: protectedProcedure.query(({ ctx }) => {
    // ctx.session is guaranteed to exist
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ ctx, input }) => {
      // Update user with ctx.session.user.id
      return { success: true };
    }),
});
```

## Comparison

| Aspect | `publicProcedure` | `protectedProcedure` |
|--------|-------------------|---------------------|
| Auth required | No | Yes |
| `ctx.session` type | `Session \| null` | `Session` |
| Error on no session | None | `UNAUTHORIZED` |
| Client handling | Normal response | Must handle 401 |

## Client Error Handling

When calling protected procedures without authentication:

```typescript
// Client-side
try {
  const data = await trpc.privateData.query();
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

## Creating Custom Procedures

You can create custom middleware-enhanced procedures:

```typescript
// Admin-only procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session.user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

// Usage
const adminRouter = router({
  deleteUser: adminProcedure.mutation(({ ctx }) => {
    // Only admins can reach here
  }),
});
```

## Related

- [Context](/api/trpc/context/) - How session is populated
- [Routers](/api/trpc/routers/) - Using procedures in routers
- [Error Handling](/api/errors/) - Error patterns
