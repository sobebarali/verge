---
title: Adding a tRPC Endpoint
description: Step-by-step guide to create new tRPC endpoints
---

This guide walks you through adding a new tRPC endpoint to Verge.

## Overview

tRPC endpoints are defined in `packages/api/src/routers/`. You'll:

1. Choose the appropriate procedure type
2. Define input validation (if needed)
3. Implement the handler
4. Test the endpoint

## Step 1: Choose Procedure Type

| Type | Use When |
|------|----------|
| `publicProcedure` | No authentication required |
| `protectedProcedure` | User must be logged in |

## Step 2: Add the Endpoint

Open `packages/api/src/routers/index.ts`:

```typescript
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const appRouter = router({
  // Existing endpoints...
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),

  // Add your new endpoint here
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),
});
```

## Step 3: Endpoint Types

### Query (Read Data)

Use `.query()` for reading data:

```typescript
getUser: protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const user = await User.findById(input.userId);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user;
  }),
```

### Mutation (Write Data)

Use `.mutation()` for creating, updating, or deleting:

```typescript
updateProfile: protectedProcedure
  .input(z.object({
    name: z.string().min(2),
  }))
  .mutation(async ({ input, ctx }) => {
    await User.findByIdAndUpdate(ctx.session.user.id, {
      name: input.name,
      updatedAt: new Date(),
    });
    return { success: true };
  }),
```

## Step 4: Input Validation

Use Zod for input validation:

```typescript
import { z } from "zod";

// Simple input
.input(z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
}))

// Optional fields
.input(z.object({
  name: z.string(),
  bio: z.string().optional(),
}))

// Arrays
.input(z.object({
  tags: z.array(z.string()),
}))

// Enums
.input(z.object({
  status: z.enum(["active", "inactive", "pending"]),
}))
```

## Step 5: Error Handling

Throw `TRPCError` for expected errors:

```typescript
import { TRPCError } from "@trpc/server";

createPost: protectedProcedure
  .input(z.object({ title: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Check permissions
    if (!ctx.session.user.canPost) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to create posts",
      });
    }

    // Resource not found
    const category = await Category.findById(input.categoryId);
    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Category not found",
      });
    }

    // Create the post
    return Post.create({ ...input, userId: ctx.session.user.id });
  }),
```

## Step 6: Test the Endpoint

### Using the Client

```typescript
// In your React app
import { trpc } from '@/utils/trpc';

// Query
const greeting = await trpc.greet.query({ name: "World" });
console.log(greeting); // { greeting: "Hello, World!" }

// Mutation
const result = await trpc.updateProfile.mutate({ name: "New Name" });
```

### Using cURL

```bash
# Query
curl -X POST http://localhost:3000/trpc/greet \
  -H "Content-Type: application/json" \
  -d '{"json": {"name": "World"}}'

# Protected endpoint (with cookie)
curl -X POST http://localhost:3000/trpc/updateProfile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"json": {"name": "New Name"}}'
```

## Complete Example

Here's a complete example adding a "projects" feature:

```typescript
// packages/api/src/routers/index.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../index";

export const appRouter = router({
  // ... existing endpoints

  // List user's projects
  listProjects: protectedProcedure.query(async ({ ctx }) => {
    return Project.find({ userId: ctx.session.user.id });
  }),

  // Get single project
  getProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const project = await Project.findOne({
        _id: input.projectId,
        userId: ctx.session.user.id,
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),

  // Create project
  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return Project.create({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  // Delete project
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await Project.deleteOne({
        _id: input.projectId,
        userId: ctx.session.user.id,
      });

      if (result.deletedCount === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return { success: true };
    }),
});
```

## Best Practices

1. **Validate all inputs** with Zod
2. **Use specific error codes** (`NOT_FOUND`, `FORBIDDEN`, etc.)
3. **Check ownership** for protected resources
4. **Keep procedures focused** on single responsibilities
5. **Use transactions** for multi-step operations

## Related

- [tRPC Setup](/api/trpc/) - tRPC configuration
- [Procedures](/api/trpc/procedures/) - Procedure types
- [Error Codes](/api/errors/error-codes/) - Error handling
