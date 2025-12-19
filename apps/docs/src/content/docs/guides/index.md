---
title: Developer Guides
description: Step-by-step guides for common development tasks
---

These guides walk you through common development tasks in the Verge codebase.

## Available Guides

### Adding Features

- [Adding a tRPC Endpoint](/guides/adding-a-trpc-endpoint/) - Create new API endpoints
- [Adding a Database Model](/guides/adding-a-database-model/) - Define new Mongoose schemas
- [Adding Authentication](/guides/adding-authentication/) - Protect routes with auth

### Development Workflow

- [Testing Locally](/guides/testing-locally/) - Local development setup and testing

## Quick Reference

### Creating a New Endpoint

```typescript
// packages/api/src/routers/index.ts
export const appRouter = router({
  // Add your new procedure here
  myEndpoint: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),
});
```

### Creating a Protected Endpoint

```typescript
// packages/api/src/routers/index.ts
export const appRouter = router({
  myProtectedEndpoint: protectedProcedure
    .query(({ ctx }) => {
      // ctx.session.user is available here
      return { user: ctx.session.user };
    }),
});
```

### Adding a New Model

```typescript
// packages/db/src/models/my-model.ts
import mongoose from "mongoose";

const mySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const MyModel = mongoose.model("MyModel", mySchema);
```
