---
title: Routers Overview
description: tRPC router organization and available endpoints
---

This section documents all tRPC routers and their endpoints.

## Source

**Location**: `packages/api/src/routers/index.ts`

```typescript
import { protectedProcedure, publicProcedure, router } from "../index";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});

export type AppRouter = typeof appRouter;
```

## Available Endpoints

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| [healthCheck](/api/trpc/routers/health-check/) | Query | Public | Service health check |
| [privateData](/api/trpc/routers/private-data/) | Query | Protected | Returns authenticated user data |

## Router Type Export

The `AppRouter` type is exported for client-side type inference:

```typescript
// packages/api/src/routers/index.ts
export type AppRouter = typeof appRouter;

// apps/web/src/utils/trpc.ts
import type { AppRouter } from '@verge/api/routers';

export const trpc = createTRPCClient<AppRouter>({
  // ...
});
```

## Router Organization

### Current Structure

```
packages/api/src/routers/
└── index.ts          # Main appRouter
```

### Recommended Future Structure

As the API grows, split into domain-specific routers:

```
packages/api/src/routers/
├── index.ts          # Merges all routers
├── user.ts           # User-related procedures
├── scraping.ts       # Web scraping procedures
└── sheets.ts         # Google Sheets procedures
```

### Merging Routers

```typescript
// packages/api/src/routers/index.ts
import { router } from "../index";
import { userRouter } from "./user";
import { scrapingRouter } from "./scraping";

export const appRouter = router({
  user: userRouter,
  scraping: scrapingRouter,
});

// Client usage: trpc.user.getProfile.query()
```

## Adding New Endpoints

1. Choose the appropriate procedure type:
   - `publicProcedure` for unauthenticated endpoints
   - `protectedProcedure` for authenticated endpoints

2. Add to the router:
   ```typescript
   export const appRouter = router({
     // Existing endpoints...

     newEndpoint: publicProcedure
       .input(z.object({ id: z.string() }))
       .query(({ input }) => {
         return { id: input.id };
       }),
   });
   ```

3. The client automatically gets the new endpoint with full types

## Related

- [healthCheck](/api/trpc/routers/health-check/) - Health check endpoint
- [privateData](/api/trpc/routers/private-data/) - Protected user data endpoint
- [Adding a tRPC Endpoint](/guides/adding-a-trpc-endpoint/) - Step-by-step guide
