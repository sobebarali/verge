---
title: Database Connection
description: MongoDB connection setup with Mongoose
---

Verge uses Mongoose to connect to MongoDB.

## Source

**Location**: `packages/db/src/index.ts`

```typescript
import mongoose from "mongoose";

await mongoose.connect(process.env.DATABASE_URL || "").catch((error) => {
  console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db("myDB");

export { client };
```

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Connection String | `DATABASE_URL` env var | MongoDB connection URI |
| Database Name | `myDB` | Default database name |

## Environment Variable

Set the connection string in your environment:

```bash
# apps/server/.env
DATABASE_URL="mongodb://localhost:27017/verge"

# or MongoDB Atlas
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/verge"
```

## Connection String Format

### Local MongoDB

```
mongodb://localhost:27017/verge
```

### MongoDB Atlas

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Client Export

The `client` export is used by Better-Auth's MongoDB adapter:

```typescript
// packages/auth/src/index.ts
import { client } from "@verge/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(client),
  // ...
});
```

## Connection Lifecycle

```
App Start
    │
    ▼
┌─────────────────┐
│ mongoose.connect│───▶ Attempts connection
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 Success    Error
    │         │
    ▼         ▼
Connected   Log error
    │       (continues)
    ▼
Export client
```

## Error Handling

The current implementation logs connection errors but doesn't halt execution:

```typescript
await mongoose.connect(process.env.DATABASE_URL || "").catch((error) => {
  console.log("Error connecting to database:", error);
});
```

For production, consider:

```typescript
try {
  await mongoose.connect(process.env.DATABASE_URL || "");
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1); // Exit if database is unavailable
}
```

## Mongoose vs Native Driver

Verge uses both:

- **Mongoose**: For schema definitions and queries
- **Native Client**: For Better-Auth adapter

```typescript
// Mongoose connection
const mongoose = require('mongoose');
await mongoose.connect(url);

// Native client (for Better-Auth)
const client = mongoose.connection.getClient().db("myDB");
```

## Testing Connection

Verify your connection is working:

```bash
# Start the server
npm run dev:server

# Check for connection logs
# Should see no error messages if successful
```

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running locally:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Authentication Failed

```
Error: Authentication failed
```

**Solution**: Check your username and password in the connection string.

### Network Error (Atlas)

```
Error: getaddrinfo ENOTFOUND
```

**Solution**:
1. Check your network connection
2. Verify the cluster URL
3. Whitelist your IP in Atlas

## Related

- [Models Overview](/database/models/) - Database schemas
- [Environment Variables](/getting-started/environment-variables/) - Configuration
