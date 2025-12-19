---
title: User Model
description: User account schema
---

The User model stores user account information.

## Schema

**Collection**: `user`

```typescript
const userSchema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, required: true },
  image: { type: String },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
}, { collection: "user" });
```

## Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | String | Yes | Yes | Primary key (UUID) |
| `name` | String | Yes | No | User's display name |
| `email` | String | Yes | Yes | User's email address |
| `emailVerified` | Boolean | Yes | No | Whether email is verified |
| `image` | String | No | No | Profile image URL |
| `createdAt` | Date | Yes | No | Account creation time |
| `updatedAt` | Date | Yes | No | Last update time |

## TypeScript Type

```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Indexes

| Index | Fields | Options |
|-------|--------|---------|
| Primary | `_id` | Unique |
| Email | `email` | Unique |

## Relationships

### Has Many Sessions

```typescript
// Find all sessions for a user
const sessions = await Session.find({ userId: user._id });
```

### Has Many Accounts

```typescript
// Find all auth accounts for a user
const accounts = await Account.find({ userId: user._id });
```

## Usage Examples

### Find User by Email

```typescript
import { User } from '@verge/db/models/auth.model';

const user = await User.findOne({ email: 'user@example.com' });
```

### Find User by ID

```typescript
const user = await User.findById(userId);
```

### Update User

```typescript
await User.findByIdAndUpdate(userId, {
  name: 'New Name',
  updatedAt: new Date(),
});
```

### Check Email Exists

```typescript
const exists = await User.exists({ email: 'user@example.com' });
```

## Managed By

The User model is primarily managed by Better-Auth:

- **Creation**: On sign-up
- **Updates**: Profile changes via Better-Auth API
- **Deletion**: Account deletion (if implemented)

## Session User Object

When accessed via session context, the user object includes:

```typescript
// ctx.session.user in tRPC procedures
{
  id: string;        // Same as _id
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Related

- [Session Model](/database/models/session/) - User sessions
- [Account Model](/database/models/account/) - Auth providers
- [Authentication](/api/authentication/) - Auth flow
