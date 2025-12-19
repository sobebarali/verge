---
title: Data Flow
description: Understanding the request lifecycle from client to database
---

This page explains how data flows through the Verge system from the React client to the MongoDB database.

## Request Lifecycle

```
┌─────────────┐    HTTP/tRPC    ┌─────────────┐    Mongoose    ┌─────────────┐
│   React     │ ──────────────▶ │    Hono     │ ────────────▶  │   MongoDB   │
│   Client    │ ◀────────────── │   Server    │ ◀────────────  │   Database  │
└─────────────┘    Response     └─────────────┘    Documents   └─────────────┘
```

## Detailed Flow

### 1. Client Request

The React client uses the tRPC proxy to make type-safe API calls:

```typescript
// apps/web/src/utils/trpc.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@verge/api';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch: (url, options) => fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for auth
      }),
    }),
  ],
});
```

### 2. Hono Server Reception

The Hono server receives the request and routes it to tRPC:

```typescript
// apps/server/src/index.ts
import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, createContext } from '@verge/api';

const app = new Hono();

app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext,  // Creates context for each request
}));
```

### 3. Context Creation

For each request, context is created with session information:

```typescript
// packages/api/src/context.ts
import { auth } from '@verge/auth';
import type { Context as HonoContext } from 'hono';

export async function createContext({ c }: { c: HonoContext }) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  return { session };
}
```

### 4. Procedure Execution

The appropriate procedure handles the request:

```typescript
// packages/api/src/routers/index.ts
export const appRouter = router({
  privateData: protectedProcedure.query(({ ctx }) => {
    // ctx.session is guaranteed to exist
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
```

### 5. Database Query

Procedures can query MongoDB via Mongoose:

```typescript
import { User } from '@verge/db/models/auth.model';

const user = await User.findById(ctx.session.user.id);
```

### 6. Response

The response flows back through the same path:

```
Mongoose Document → tRPC Serialization → HTTP Response → React State
```

## Authentication Flow

```
┌─────────┐   Sign In   ┌─────────┐   Validate   ┌─────────┐   Store    ┌─────────┐
│ Client  │ ──────────▶ │  Hono   │ ───────────▶ │ Better  │ ────────▶ │ MongoDB │
│         │             │ /api/   │              │  Auth   │            │ Session │
│         │ ◀────────── │  auth   │ ◀─────────── │         │ ◀──────── │         │
└─────────┘   Cookie    └─────────┘   Session    └─────────┘   Created  └─────────┘
```

### Cookie-Based Sessions

1. **Sign In**: User submits credentials to `/api/auth/sign-in/email`
2. **Validation**: Better-Auth validates credentials against `account` collection
3. **Session Creation**: New session created in `session` collection
4. **Cookie Set**: Session token returned as HttpOnly cookie
5. **Subsequent Requests**: Cookie automatically included, session validated via context

## Error Flow

```
┌─────────┐              ┌─────────┐              ┌─────────┐
│ Client  │ ◀── TRPCError ── │ tRPC    │ ◀── throw ── │Procedure│
│ Toast   │              │         │              │         │
└─────────┘              └─────────┘              └─────────┘
```

Errors are caught and displayed:

```typescript
// Client error handling
trpc.privateData.query()
  .catch(err => {
    toast.error(err.message);
  });
```

## Type Safety

The entire flow is type-safe thanks to tRPC:

1. **Input types** are inferred from Zod schemas
2. **Output types** are inferred from return values
3. **Client** gets full autocompletion and type checking

```typescript
// The client knows the exact shape of the response
const data = await trpc.privateData.query();
// data.user is typed as the User object
```

## Related

- [tRPC Context](/api/trpc/context/) - Context creation details
- [Procedures](/api/trpc/procedures/) - Public vs protected
- [Session Management](/api/authentication/session-management/) - Session lifecycle
