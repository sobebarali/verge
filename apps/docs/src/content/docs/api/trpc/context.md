---
title: Context
description: tRPC request context and session handling
---

The context provides request-scoped data to all tRPC procedures, including the authenticated user session.

## Source

**Location**: `packages/api/src/context.ts`

```typescript
import type { Context as HonoContext } from "hono";
import { auth } from "@verge/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

## Context Shape

Every tRPC procedure receives context with this shape:

```typescript
type Context = {
  session: Session | null;
};

type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
};
```

## Context Creation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │────▶│   Hono      │────▶│ createContext│
│   Headers   │     │  Middleware │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Better-Auth │
                                        │ getSession  │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Context    │
                                        │  { session }│
                                        └─────────────┘
```

### Step-by-step

1. **Request arrives**: HTTP request hits Hono server
2. **tRPC middleware**: `@hono/trpc-server` invokes `createContext`
3. **Hono context passed**: Raw request headers are available
4. **Session retrieval**: Better-Auth extracts session from cookies
5. **Context returned**: `{ session }` available in all procedures

## Usage in Procedures

### Accessing Session

```typescript
// Public procedure - session may be null
export const appRouter = router({
  maybeUser: publicProcedure.query(({ ctx }) => {
    if (ctx.session) {
      return { user: ctx.session.user };
    }
    return { user: null };
  }),
});
```

### Protected Procedure

```typescript
// Protected procedure - session guaranteed
export const appRouter = router({
  privateData: protectedProcedure.query(({ ctx }) => {
    // ctx.session is never null here
    return {
      user: ctx.session.user,
      message: "Authenticated!",
    };
  }),
});
```

## Extending Context

To add more data to context:

```typescript
// packages/api/src/context.ts
export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // Add more context data
  return {
    session,
    requestId: crypto.randomUUID(),
    ip: context.req.header('x-forwarded-for'),
  };
}
```

## Type Export

The `Context` type is exported for use in procedures:

```typescript
// Used in packages/api/src/index.ts
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();
```

## Related

- [Procedures](/api/trpc/procedures/) - Using context in procedures
- [Session Management](/api/authentication/session-management/) - How sessions work
- [Data Flow](/architecture/data-flow/) - Full request lifecycle
