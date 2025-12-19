---
title: Session Management
description: Cookie-based session handling with Better-Auth
---

Verge uses cookie-based sessions managed by Better-Auth.

## Cookie Configuration

Sessions are stored in secure, HttpOnly cookies:

```typescript
// packages/auth/src/index.ts
export const auth = betterAuth({
  // ...
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",   // Allow cross-origin requests
      secure: true,       // HTTPS only
      httpOnly: true,     // No JavaScript access
    },
  },
});
```

### Cookie Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `sameSite` | `"none"` | Allows cookies in cross-origin requests |
| `secure` | `true` | Cookie only sent over HTTPS |
| `httpOnly` | `true` | Prevents XSS attacks (no JS access) |

## Session Lifecycle

### Creation

Sessions are created on:
- Successful sign-up
- Successful sign-in

```
User Signs In
     │
     ▼
┌─────────────────┐
│ Validate Creds  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Session  │──▶ MongoDB `session` collection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Set Cookie      │──▶ Session token in cookie
└─────────────────┘
```

### Validation

Each request validates the session:

```
Request with Cookie
     │
     ▼
┌─────────────────┐
│ Extract Token   │◀── From cookie header
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Find Session    │◀── Query MongoDB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Expiry    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 Valid     Expired
    │         │
    ▼         ▼
 Continue   UNAUTHORIZED
```

### Expiration

- Default expiration: 7 days
- Stored in `session.expiresAt`
- Expired sessions are invalid

### Termination

Sessions end when:
- User signs out (`/api/auth/sign-out`)
- Session expires
- Session is manually revoked

## Session Schema

Sessions are stored in MongoDB:

```typescript
// packages/db/src/models/auth.model.ts
const sessionSchema = new Schema({
  _id: { type: String },
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  userId: { type: String, ref: "User", required: true },
});
```

| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Session ID |
| `token` | String | Session token (in cookie) |
| `userId` | String | Associated user |
| `expiresAt` | Date | Expiration timestamp |
| `ipAddress` | String | Client IP (for security) |
| `userAgent` | String | Browser/client info |

## Retrieving Session

### Server-Side (tRPC Context)

```typescript
// packages/api/src/context.ts
export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return { session };
}
```

### Client-Side

```typescript
import { authClient } from '@/lib/auth-client';

// Get current session
const session = await authClient.getSession();

if (session) {
  console.log('Logged in as:', session.user.email);
} else {
  console.log('Not logged in');
}
```

## Cross-Origin Considerations

For cross-origin requests (frontend and API on different domains):

1. **CORS Origin**: Set `CORS_ORIGIN` environment variable
2. **Credentials**: Include credentials in fetch requests
3. **SameSite=none**: Allows cookies across origins

```typescript
// Client fetch configuration
fetch(url, {
  credentials: 'include',  // Include cookies
});

// tRPC client configuration
httpBatchLink({
  url: '/trpc',
  fetch: (url, options) => fetch(url, {
    ...options,
    credentials: 'include',
  }),
});
```

## Security Best Practices

1. **Always use HTTPS**: Secure cookies require HTTPS
2. **Rotate sessions**: Sign out and back in periodically
3. **Monitor suspicious activity**: Track IP and user agent changes
4. **Implement session limits**: Limit concurrent sessions per user

## Related

- [Endpoints](/api/authentication/endpoints/) - Auth API routes
- [Session Model](/database/models/session/) - Session schema details
- [Context](/api/trpc/context/) - Session in tRPC context
