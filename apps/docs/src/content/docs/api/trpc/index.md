---
title: tRPC Setup & Conventions
description: tRPC initialization and usage patterns in Verge
---

Verge uses tRPC for end-to-end type-safe API communication between the React client and Hono server.

## Overview

| Component | Location |
|-----------|----------|
| tRPC Setup | `packages/api/src/index.ts` |
| Context | `packages/api/src/context.ts` |
| Routers | `packages/api/src/routers/` |

## Initialization

tRPC is initialized in `packages/api/src/index.ts`:

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

// Initialize tRPC with context type
export const t = initTRPC.context<Context>().create();

// Export router factory
export const router = t.router;

// Export procedure types
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(/* auth middleware */);
```

## Exports

The `@verge/api` package exports:

| Export | Type | Description |
|--------|------|-------------|
| `t` | tRPC Instance | The initialized tRPC instance |
| `router` | Function | Router factory for creating routers |
| `publicProcedure` | Procedure | Base procedure (no auth required) |
| `protectedProcedure` | Procedure | Procedure with auth middleware |
| `createContext` | Function | Creates request context |
| `AppRouter` | Type | Router type for client inference |

## Server Integration

The Hono server integrates tRPC via middleware:

```typescript
// apps/server/src/index.ts
import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from '@verge/api/routers';
import { createContext } from '@verge/api/context';

const app = new Hono();

app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext: ({ c }) => createContext({ context: c }),
}));
```

## Client Integration

The React client uses tRPC with React Query:

```typescript
// apps/web/src/utils/trpc.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@verge/api/routers';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
      fetch: (url, options) => fetch(url, {
        ...options,
        credentials: 'include',
      }),
    }),
  ],
});
```

## Type Safety

tRPC provides end-to-end type safety:

1. **Server**: Define procedures with typed inputs and outputs
2. **Client**: Types are automatically inferred from `AppRouter`
3. **No codegen**: Types work at compile time, no build step needed

```typescript
// Full type inference on the client
const data = await trpc.privateData.query();
// data.user is typed as the User object
// data.message is typed as string
```

## Conventions

### Procedure Naming

- Use **camelCase** for procedure names
- Use **verbs** for mutations: `createUser`, `updateProfile`
- Use **nouns** for queries: `user`, `users`, `userData`

### Router Organization

```
routers/
├── index.ts      # Main appRouter (merges sub-routers)
├── user.ts       # User-related procedures
├── scraping.ts   # Scraping-related procedures (future)
```

### Input Validation

Always use Zod for input validation:

```typescript
import { z } from 'zod';

const myProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    name: z.string().min(2),
  }))
  .mutation(({ input }) => {
    // input is typed and validated
  });
```

## Related

- [Context](/api/trpc/context/) - Request context and session
- [Procedures](/api/trpc/procedures/) - Public vs protected
- [Routers](/api/trpc/routers/) - Available endpoints
