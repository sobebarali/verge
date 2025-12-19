---
title: "@verge/api"
description: tRPC API layer package documentation
---

The `@verge/api` package contains the tRPC router definitions, procedures, and context creation.

## Package Info

| Property | Value |
|----------|-------|
| **Location** | `packages/api/` |
| **Main Entry** | `src/index.ts` |
| **Consumed By** | `apps/server`, `apps/web` |

## Exports

### From `index.ts`

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(/* auth middleware */);
```

| Export | Type | Description |
|--------|------|-------------|
| `t` | tRPC Instance | Initialized tRPC instance |
| `router` | Function | Router factory |
| `publicProcedure` | Procedure | Unauthenticated procedure |
| `protectedProcedure` | Procedure | Authenticated procedure |

### From `context.ts`

```typescript
export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

| Export | Type | Description |
|--------|------|-------------|
| `createContext` | Function | Context factory for requests |
| `Context` | Type | Context type definition |

### From `routers/index.ts`

```typescript
export const appRouter = router({ /* procedures */ });
export type AppRouter = typeof appRouter;
```

| Export | Type | Description |
|--------|------|-------------|
| `appRouter` | Router | Main application router |
| `AppRouter` | Type | Router type for client inference |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@trpc/server` | tRPC server implementation |
| `hono` | Context type (type-only) |
| `@verge/auth` | Authentication |
| `@verge/db` | Database access |

## File Structure

```
packages/api/
├── src/
│   ├── index.ts          # tRPC setup, procedures
│   ├── context.ts        # Context creation
│   └── routers/
│       └── index.ts      # App router definition
├── package.json
└── tsconfig.json
```

## Usage

### In Server

```typescript
// apps/server/src/index.ts
import { appRouter } from '@verge/api/routers';
import { createContext } from '@verge/api/context';
import { trpcServer } from '@hono/trpc-server';

app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext: ({ c }) => createContext({ context: c }),
}));
```

### In Web (Types Only)

```typescript
// apps/web/src/utils/trpc.ts
import type { AppRouter } from '@verge/api/routers';
import { createTRPCClient } from '@trpc/client';

export const trpc = createTRPCClient<AppRouter>({
  // ...
});
```

## Adding New Endpoints

1. Open `packages/api/src/routers/index.ts`
2. Add your procedure:

```typescript
export const appRouter = router({
  // Existing procedures...

  myNewEndpoint: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return { id: input.id };
    }),
});
```

3. The client automatically gets the new endpoint

## Related

- [tRPC Setup](/api/trpc/) - tRPC configuration
- [Context](/api/trpc/context/) - Context details
- [Routers](/api/trpc/routers/) - Available endpoints
