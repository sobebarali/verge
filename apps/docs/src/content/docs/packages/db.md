---
title: "@verge/db"
description: Database package documentation
---

The `@verge/db` package manages MongoDB connection and Mongoose model definitions.

## Package Info

| Property | Value |
|----------|-------|
| **Location** | `packages/db/` |
| **Main Entry** | `src/index.ts` |
| **Consumed By** | `@verge/auth`, `@verge/api` |

## Exports

### From `index.ts`

```typescript
import mongoose from "mongoose";

await mongoose.connect(process.env.DATABASE_URL || "");

const client = mongoose.connection.getClient().db("myDB");

export { client };
```

| Export | Type | Description |
|--------|------|-------------|
| `client` | Db | MongoDB native client database instance |

### From `models/auth.model.ts`

```typescript
export { User, Session, Account, Verification };
```

| Export | Type | Description |
|--------|------|-------------|
| `User` | Model | User account model |
| `Session` | Model | Session model |
| `Account` | Model | Auth provider account model |
| `Verification` | Model | Verification token model |

## Dependencies

| Package | Purpose |
|---------|---------|
| `mongoose` | MongoDB ODM |
| `dotenv` | Environment variables |
| `zod` | Schema validation |

## File Structure

```
packages/db/
├── src/
│   ├── index.ts              # Connection setup
│   └── models/
│       └── auth.model.ts     # Auth-related models
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |

## Connection

The package connects to MongoDB on import:

```typescript
await mongoose.connect(process.env.DATABASE_URL || "");
```

The native client is exported for Better-Auth:

```typescript
const client = mongoose.connection.getClient().db("myDB");
export { client };
```

## Usage

### In Auth Package

```typescript
// packages/auth/src/index.ts
import { client } from "@verge/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(client),
});
```

### Using Models

```typescript
import { User, Session } from '@verge/db/models/auth.model';

// Find user
const user = await User.findOne({ email: 'user@example.com' });

// Find sessions
const sessions = await Session.find({ userId: user._id });
```

## Available Models

### User

Stores user account information.

```typescript
const userSchema = new Schema({
  _id: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, required: true },
  image: String,
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
```

### Session

Stores active user sessions.

```typescript
const sessionSchema = new Schema({
  _id: String,
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  ipAddress: String,
  userAgent: String,
  userId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
```

### Account

Stores auth provider accounts.

```typescript
const accountSchema = new Schema({
  _id: String,
  accountId: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  accessToken: String,
  refreshToken: String,
  password: String,
  // ... more fields
});
```

### Verification

Stores verification tokens.

```typescript
const verificationSchema = new Schema({
  _id: String,
  identifier: { type: String, required: true },
  value: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});
```

## Adding New Models

Create a new model file:

```typescript
// packages/db/src/models/project.model.ts
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: "project" });

export const Project = mongoose.model("Project", projectSchema);
```

## Related

- [Database Overview](/database/) - Database architecture
- [Connection](/database/connection/) - Connection details
- [Models](/database/models/) - All model documentation
