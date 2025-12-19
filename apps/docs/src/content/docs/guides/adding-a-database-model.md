---
title: Adding a Database Model
description: Step-by-step guide to create new Mongoose models
---

This guide walks you through adding a new Mongoose model to Verge.

## Overview

Models are defined in `packages/db/src/models/`. You'll:

1. Create a new model file
2. Define the schema
3. Export the model
4. Use it in your API procedures

## Step 1: Create the Model File

Create a new file in `packages/db/src/models/`:

```typescript
// packages/db/src/models/project.model.ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;
```

## Step 2: Define the Schema

```typescript
// packages/db/src/models/project.model.ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    userId: { type: String, ref: "User", required: true },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "project" }
);

export const Project = model("Project", projectSchema);
```

## Schema Field Types

### Common Types

```typescript
const schema = new Schema({
  // String
  name: { type: String, required: true },

  // Number
  count: { type: Number, default: 0 },

  // Boolean
  isActive: { type: Boolean, default: true },

  // Date
  createdAt: { type: Date, default: Date.now },

  // Array of strings
  tags: [{ type: String }],

  // Array of objects
  items: [{
    name: String,
    quantity: Number,
  }],

  // Reference to another model
  userId: { type: String, ref: "User", required: true },

  // Enum
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
});
```

### Field Options

| Option | Description |
|--------|-------------|
| `required` | Field must have a value |
| `default` | Default value if not provided |
| `unique` | Enforce unique values |
| `ref` | Reference to another model |
| `enum` | Restrict to specific values |
| `min/max` | Number range validation |
| `minLength/maxLength` | String length validation |

## Step 3: Add Indexes

Add indexes for frequently queried fields:

```typescript
const projectSchema = new Schema({
  // ... fields
});

// Single field index
projectSchema.index({ userId: 1 });

// Compound index
projectSchema.index({ userId: 1, status: 1 });

// Unique index
projectSchema.index({ name: 1, userId: 1 }, { unique: true });

// Text index (for search)
projectSchema.index({ name: "text", description: "text" });
```

## Step 4: Add Methods (Optional)

### Instance Methods

```typescript
projectSchema.methods.archive = function() {
  this.status = "archived";
  this.updatedAt = new Date();
  return this.save();
};

// Usage
const project = await Project.findById(id);
await project.archive();
```

### Static Methods

```typescript
projectSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, status: { $ne: "deleted" } });
};

// Usage
const projects = await Project.findByUser(userId);
```

## Step 5: Use in API Procedures

```typescript
// packages/api/src/routers/index.ts
import { Project } from "@verge/db/models/project.model";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const appRouter = router({
  // List projects
  listProjects: protectedProcedure.query(async ({ ctx }) => {
    return Project.find({
      userId: ctx.session.user.id,
      status: { $ne: "deleted" },
    }).sort({ createdAt: -1 });
  }),

  // Create project
  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = new Project({
        _id: crypto.randomUUID(),
        ...input,
        userId: ctx.session.user.id,
      });
      await project.save();
      return project;
    }),

  // Update project
  updateProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { projectId, ...updates } = input;

      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId: ctx.session.user.id },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return project;
    }),
});
```

## Complete Example

Here's a complete model for a "scraping job":

```typescript
// packages/db/src/models/scraping-job.model.ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const scrapingJobSchema = new Schema(
  {
    _id: { type: String },
    url: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    userId: { type: String, ref: "User", required: true },
    projectId: { type: String, ref: "Project" },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "scraping_job" }
);

// Indexes
scrapingJobSchema.index({ userId: 1, status: 1 });
scrapingJobSchema.index({ projectId: 1 });
scrapingJobSchema.index({ createdAt: -1 });

// Methods
scrapingJobSchema.methods.start = function() {
  this.status = "running";
  this.startedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

scrapingJobSchema.methods.complete = function(result: any) {
  this.status = "completed";
  this.result = result;
  this.completedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

scrapingJobSchema.methods.fail = function(error: string) {
  this.status = "failed";
  this.error = error;
  this.completedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

export const ScrapingJob = model("ScrapingJob", scrapingJobSchema);
```

## Best Practices

1. **Use String IDs** (`_id: { type: String }`) for consistency with Better-Auth
2. **Add timestamps** (`createdAt`, `updatedAt`)
3. **Index frequently queried fields**
4. **Use `ref` for relationships**
5. **Specify collection names** explicitly
6. **Add validation** at the schema level

## Related

- [Models Overview](/database/models/) - All models
- [Adding a tRPC Endpoint](/guides/adding-a-trpc-endpoint/) - Using models in API
