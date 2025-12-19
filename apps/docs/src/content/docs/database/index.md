---
title: Database Overview
description: MongoDB database architecture and Mongoose models
---

Verge uses MongoDB with Mongoose for data persistence. This section covers the database connection, models, and query patterns.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Database | MongoDB |
| ODM | Mongoose |
| Adapter | Better-Auth MongoDB Adapter |

## Connection

The database connection is managed in `packages/db/src/index.ts`:

```typescript
import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL!, {
  dbName: "myDB",
});

export const client = mongoose.connection.getClient();
```

The `client` export is used by Better-Auth's MongoDB adapter.

## Models

Verge uses the following database models:

| Model | Collection | Purpose |
|-------|------------|---------|
| [User](/database/models/user/) | `user` | User accounts |
| [Session](/database/models/session/) | `session` | Active sessions |
| [Account](/database/models/account/) | `account` | Auth provider accounts |
| [Verification](/database/models/verification/) | `verification` | Email verification tokens |

## Sections

- [Connection](/database/connection/) - Database connection configuration
- [Models](/database/models/) - Complete model reference
