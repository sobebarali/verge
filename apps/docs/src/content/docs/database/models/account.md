---
title: Account Model
description: Authentication provider account schema
---

The Account model stores authentication provider accounts, including email/password credentials and OAuth tokens.

## Schema

**Collection**: `account`

```typescript
const accountSchema = new Schema({
  _id: { type: String },
  accountId: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  idToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  refreshTokenExpiresAt: { type: Date },
  scope: { type: String },
  password: { type: String },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
}, { collection: "account" });
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | String | Yes | Primary key (UUID) |
| `accountId` | String | Yes | Provider-specific account ID |
| `providerId` | String | Yes | Auth provider (e.g., "credential", "google") |
| `userId` | String | Yes | Reference to User |
| `accessToken` | String | No | OAuth access token |
| `refreshToken` | String | No | OAuth refresh token |
| `idToken` | String | No | OAuth ID token |
| `accessTokenExpiresAt` | Date | No | Access token expiration |
| `refreshTokenExpiresAt` | Date | No | Refresh token expiration |
| `scope` | String | No | OAuth scope |
| `password` | String | No | Hashed password (for email auth) |
| `createdAt` | Date | Yes | Account link time |
| `updatedAt` | Date | Yes | Last update time |

## TypeScript Type

```typescript
interface Account {
  _id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Provider Types

### Email/Password (`credential`)

For email/password authentication:

```typescript
{
  accountId: "user@example.com",
  providerId: "credential",
  userId: "user_123",
  password: "$2b$10$...",  // Hashed password
}
```

### OAuth Providers

For OAuth authentication (e.g., Google, GitHub):

```typescript
{
  accountId: "google_user_id",
  providerId: "google",
  userId: "user_123",
  accessToken: "ya29...",
  refreshToken: "1//...",
  accessTokenExpiresAt: new Date("2024-01-08"),
  scope: "email profile",
}
```

## Relationships

### Belongs To User

```typescript
// Find user for an account
const account = await Account.findById(accountId);
const user = await User.findById(account.userId);
```

### Multiple Accounts Per User

A user can have multiple accounts (e.g., password + Google):

```typescript
const accounts = await Account.find({ userId: user._id });
// [
//   { providerId: "credential", ... },
//   { providerId: "google", ... }
// ]
```

## Password Storage

For email/password authentication:

- Passwords are hashed using bcrypt
- Never stored in plain text
- Stored in the `password` field

```typescript
// Verification happens in Better-Auth
// Never compare passwords directly in application code
```

## Usage Examples

### Find Account by Provider

```typescript
import { Account } from '@verge/db/models/auth.model';

const account = await Account.findOne({
  userId: user._id,
  providerId: 'credential',
});
```

### Check If User Has Password

```typescript
const hasPassword = await Account.exists({
  userId: user._id,
  providerId: 'credential',
  password: { $exists: true },
});
```

### List User's Auth Methods

```typescript
const accounts = await Account.find({ userId: user._id });
const providers = accounts.map(a => a.providerId);
// ["credential", "google"]
```

## Managed By

The Account model is managed by Better-Auth:

- **Creation**: On sign-up or OAuth link
- **Updates**: Token refresh, password change
- **Deletion**: Account unlink

## Security Considerations

1. **Password hashing**: Always handled by Better-Auth
2. **Token storage**: OAuth tokens encrypted at rest (recommended)
3. **Scope limitation**: Request minimal OAuth scopes
4. **Token refresh**: Handled automatically by Better-Auth

## Related

- [User Model](/database/models/user/) - Parent user account
- [Email & Password](/api/authentication/email-password/) - Auth flow
