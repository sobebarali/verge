---
title: Authentication Overview
description: Better-Auth configuration and authentication system
---

Verge uses Better-Auth for authentication with MongoDB storage and Polar payment integration.

## Source

**Location**: `packages/auth/src/index.ts`

```typescript
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { client } from "@verge/db";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { polarClient } from "./lib/payments";

export const auth = betterAuth({
  database: mongodbAdapter(client),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [checkout({ ... }), portal()],
    }),
  ],
});
```

## Configuration Overview

| Setting | Value | Description |
|---------|-------|-------------|
| Database | MongoDB (Mongoose) | Via `mongodbAdapter` |
| Auth Method | Email & Password | Basic email/password authentication |
| Cookies | SameSite=none, Secure, HttpOnly | Cross-origin cookie configuration |
| Payment | Polar | Subscription management |

## Key Features

### Email & Password Authentication

- User registration with email and password
- Login with credentials
- Password requirements (configurable)

### Session Management

- Cookie-based sessions
- Secure, HttpOnly cookies for XSS protection
- SameSite=none for cross-origin requests

### Polar Integration

- Automatic customer creation on sign-up
- Checkout flow for subscriptions
- Customer portal for subscription management

## Database Collections

Better-Auth creates and manages these MongoDB collections:

| Collection | Purpose |
|------------|---------|
| `user` | User accounts |
| `session` | Active sessions |
| `account` | Auth provider accounts |
| `verification` | Email verification tokens |

## Sections

- [Endpoints](/api/authentication/endpoints/) - Auth API routes
- [Email & Password](/api/authentication/email-password/) - Email/password flow
- [Session Management](/api/authentication/session-management/) - Cookie and session handling
- [Client Integration](/api/authentication/client-integration/) - React auth client setup

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGIN` | Yes | Allowed origin for auth requests |
| `POLAR_ACCESS_TOKEN` | Yes | Polar API token |
| `POLAR_SUCCESS_URL` | Yes | Redirect after checkout |

## Related

- [Payments Overview](/api/payments/) - Polar integration details
- [Database Models](/database/models/) - User and session schemas
