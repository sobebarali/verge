---
title: Verification Model
description: Email verification token schema
---

The Verification model stores tokens for email verification and password reset.

## Schema

**Collection**: `verification`

```typescript
const verificationSchema = new Schema({
  _id: { type: String },
  identifier: { type: String, required: true },
  value: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, { collection: "verification" });
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | String | Yes | Primary key (UUID) |
| `identifier` | String | Yes | Email or token identifier |
| `value` | String | Yes | Verification code/token |
| `expiresAt` | Date | Yes | Token expiration time |
| `createdAt` | Date | No | Token creation time |
| `updatedAt` | Date | No | Last update time |

## TypeScript Type

```typescript
interface Verification {
  _id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Use Cases

### Email Verification

When a user signs up, a verification token is created:

```typescript
{
  identifier: "user@example.com",
  value: "abc123...",           // Random token
  expiresAt: new Date("2024-01-02T00:00:00Z"),
}
```

### Password Reset

When a user requests password reset:

```typescript
{
  identifier: "password-reset:user@example.com",
  value: "xyz789...",           // Random token
  expiresAt: new Date("2024-01-01T01:00:00Z"),  // Short expiry
}
```

## Token Lifecycle

### Creation

```
User Action (sign-up / reset request)
           │
           ▼
┌─────────────────────────┐
│   Generate Random Token │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Store in Verification │
│   - identifier          │
│   - value (token)       │
│   - expiresAt           │
└────────────┬────────────┘
             │
             ▼
      Send Email with Token
```

### Validation

```
User Clicks Verification Link
           │
           ▼
┌─────────────────────────┐
│   Find by identifier    │
│   and value             │
└────────────┬────────────┘
             │
        ┌────┴────┐
        │         │
     Found     Not Found
        │         │
        ▼         ▼
  Check Expiry   Error
        │
   ┌────┴────┐
   │         │
 Valid    Expired
   │         │
   ▼         ▼
 Process   Error
```

### Deletion

Tokens are deleted after:
- Successful verification
- Expiration (cleanup job)

## Security Considerations

### Token Generation

- Use cryptographically secure random tokens
- Sufficient length (32+ bytes)
- Handled by Better-Auth

### Expiration

| Use Case | Recommended Expiry |
|----------|-------------------|
| Email verification | 24-72 hours |
| Password reset | 1 hour |

### Single Use

Tokens should be deleted immediately after use to prevent reuse.

## Usage Examples

### Find Verification Token

```typescript
import { Verification } from '@verge/db/models/auth.model';

const verification = await Verification.findOne({
  identifier: 'user@example.com',
  value: token,
  expiresAt: { $gt: new Date() },
});
```

### Delete Expired Tokens

```typescript
// Cleanup task
await Verification.deleteMany({
  expiresAt: { $lt: new Date() },
});
```

### Check Token Exists

```typescript
const exists = await Verification.exists({
  identifier: 'user@example.com',
  expiresAt: { $gt: new Date() },
});
```

## Managed By

The Verification model is managed by Better-Auth:

- **Creation**: On verification request
- **Validation**: On verification attempt
- **Deletion**: After successful verification

## Related

- [User Model](/database/models/user/) - User account
- [Email & Password](/api/authentication/email-password/) - Auth flow
- [Authentication](/api/authentication/) - Overview
