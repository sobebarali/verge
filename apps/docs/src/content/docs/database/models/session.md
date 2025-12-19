---
title: Session Model
description: User session schema
---

The Session model stores active user sessions for authentication.

## Schema

**Collection**: `session`

```typescript
const sessionSchema = new Schema({
  _id: { type: String },
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  userId: { type: String, ref: "User", required: true },
}, { collection: "session" });
```

## Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | String | Yes | Yes | Primary key (UUID) |
| `expiresAt` | Date | Yes | No | Session expiration time |
| `token` | String | Yes | Yes | Session token (in cookie) |
| `createdAt` | Date | Yes | No | Session creation time |
| `updatedAt` | Date | Yes | No | Last activity time |
| `ipAddress` | String | No | No | Client IP address |
| `userAgent` | String | No | No | Browser/client info |
| `userId` | String | Yes | No | Reference to User |

## TypeScript Type

```typescript
interface Session {
  _id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}
```

## Indexes

| Index | Fields | Options |
|-------|--------|---------|
| Primary | `_id` | Unique |
| Token | `token` | Unique |
| User ID | `userId` | - |
| Expiration | `expiresAt` | - |

## Relationships

### Belongs To User

```typescript
// Find the user for a session
const session = await Session.findById(sessionId).populate('userId');
// or
const user = await User.findById(session.userId);
```

## Session Lifecycle

### Creation

Sessions are created on successful sign-in:

```
Sign In
   │
   ▼
Validate Credentials
   │
   ▼
┌─────────────────┐
│ Create Session  │
│ - Generate token│
│ - Set expiresAt │
│ - Store IP/UA   │
└────────┬────────┘
         │
         ▼
Set Cookie with token
```

### Validation

Each request validates the session:

```typescript
// packages/api/src/context.ts
const session = await auth.api.getSession({
  headers: context.req.raw.headers,
});
```

### Expiration

- Default expiration: 7 days from creation
- Expired sessions are invalid
- Can be cleaned up periodically

### Deletion

Sessions are deleted on sign-out:

```typescript
// Triggered by auth.signOut()
await Session.deleteOne({ token });
```

## Usage Examples

### Find Active Sessions

```typescript
import { Session } from '@verge/db/models/auth.model';

const activeSessions = await Session.find({
  userId: user._id,
  expiresAt: { $gt: new Date() },
});
```

### Count User Sessions

```typescript
const count = await Session.countDocuments({
  userId: user._id,
  expiresAt: { $gt: new Date() },
});
```

### Delete All User Sessions

```typescript
// Sign out from all devices
await Session.deleteMany({ userId: user._id });
```

### Delete Expired Sessions

```typescript
// Cleanup task
await Session.deleteMany({
  expiresAt: { $lt: new Date() },
});
```

## Security Fields

### IP Address

Stored for:
- Security auditing
- Detecting suspicious activity
- Session management UI

### User Agent

Stored for:
- Identifying device type
- Session management UI ("Chrome on Mac")
- Security alerts on new devices

## Managed By

The Session model is managed by Better-Auth:

- **Creation**: On sign-in
- **Validation**: On each authenticated request
- **Deletion**: On sign-out

## Related

- [User Model](/database/models/user/) - User account
- [Session Management](/api/authentication/session-management/) - Session handling
- [Context](/api/trpc/context/) - Session in tRPC
