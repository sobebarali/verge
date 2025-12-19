---
title: Models Overview
description: MongoDB models used in Verge
---

Verge uses Mongoose models for data persistence. Currently, all models are managed by Better-Auth for authentication.

## Source

**Location**: `packages/db/src/models/auth.model.ts`

## Available Models

| Model | Collection | Purpose |
|-------|------------|---------|
| [User](/database/models/user/) | `user` | User accounts |
| [Session](/database/models/session/) | `session` | Active sessions |
| [Account](/database/models/account/) | `account` | Auth provider accounts |
| [Verification](/database/models/verification/) | `verification` | Email verification tokens |

## Model Relationships

```
┌─────────────┐       ┌─────────────┐
│    User     │◀──────│   Session   │
│             │       │   (userId)  │
└──────┬──────┘       └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐       ┌─────────────┐
│   Account   │       │ Verification│
│   (userId)  │       │             │
└─────────────┘       └─────────────┘
```

### Relationships

- **User → Session**: One-to-many (user can have multiple sessions)
- **User → Account**: One-to-many (user can have multiple auth providers)
- **Verification**: Standalone tokens for email verification

## Model Export

```typescript
// packages/db/src/models/auth.model.ts
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Schema definitions...

export { User, Session, Account, Verification };
```

## Usage in Application

### Querying Models

```typescript
import { User, Session } from '@verge/db/models/auth.model';

// Find user by ID
const user = await User.findById(userId);

// Find user by email
const user = await User.findOne({ email: 'user@example.com' });

// Find active sessions for user
const sessions = await Session.find({ userId, expiresAt: { $gt: new Date() } });
```

### Better-Auth Management

Most model operations are handled by Better-Auth:

- User creation (sign-up)
- Session creation/deletion (sign-in/out)
- Account linking (OAuth)
- Verification tokens

## Schema Conventions

All models follow these conventions:

| Convention | Implementation |
|------------|----------------|
| Primary Key | `_id: String` |
| Timestamps | `createdAt`, `updatedAt` |
| Collection Names | Lowercase singular (`user`, `session`) |
| References | `{ type: String, ref: "ModelName" }` |

## Adding Custom Models

To add new models for Verge-specific data:

1. Create a new file in `packages/db/src/models/`
2. Define the Mongoose schema
3. Export the model
4. Import where needed

Example:

```typescript
// packages/db/src/models/project.model.ts
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: "project" });

export const Project = mongoose.model("Project", projectSchema);
```

## Related

- [User Model](/database/models/user/) - User schema details
- [Session Model](/database/models/session/) - Session schema details
- [Account Model](/database/models/account/) - Account schema details
- [Verification Model](/database/models/verification/) - Verification schema details
