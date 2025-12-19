---
title: "@verge/auth"
description: Better-Auth authentication package documentation
---

The `@verge/auth` package configures Better-Auth with MongoDB and Polar payments integration.

## Package Info

| Property | Value |
|----------|-------|
| **Location** | `packages/auth/` |
| **Main Entry** | `src/index.ts` |
| **Consumed By** | `apps/server`, `@verge/api` |

## Exports

### From `index.ts`

```typescript
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { polar, checkout, portal } from "@polar-sh/better-auth";

export const auth = betterAuth({
  database: mongodbAdapter(client),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: { enabled: true },
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

| Export | Type | Description |
|--------|------|-------------|
| `auth` | BetterAuth | Configured auth instance |

## Dependencies

| Package | Purpose |
|---------|---------|
| `better-auth` | Auth framework |
| `better-auth/adapters/mongodb` | MongoDB adapter |
| `@polar-sh/better-auth` | Polar payments plugin |
| `@polar-sh/sdk` | Polar SDK |
| `@verge/db` | Database client |

## File Structure

```
packages/auth/
├── src/
│   ├── index.ts          # Auth configuration
│   └── lib/
│       └── payments.ts   # Polar client setup
├── package.json
└── tsconfig.json
```

## Configuration Details

### Database Adapter

```typescript
import { client } from "@verge/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

database: mongodbAdapter(client)
```

Uses the MongoDB client from `@verge/db`.

### Email/Password

```typescript
emailAndPassword: {
  enabled: true,
}
```

Enables basic email/password authentication.

### Cookie Settings

```typescript
advanced: {
  defaultCookieAttributes: {
    sameSite: "none",   // Cross-origin requests
    secure: true,       // HTTPS only
    httpOnly: true,     // No JS access
  },
}
```

### Polar Integration

```typescript
plugins: [
  polar({
    client: polarClient,
    createCustomerOnSignUp: true,
    enableCustomerPortal: true,
    use: [
      checkout({ products: [...], successUrl: "..." }),
      portal(),
    ],
  }),
]
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGIN` | Yes | Trusted origin for auth |
| `POLAR_ACCESS_TOKEN` | Yes | Polar API token |
| `POLAR_SUCCESS_URL` | Yes | Checkout success redirect |

## Usage

### In Server

```typescript
// apps/server/src/index.ts
import { auth } from "@verge/auth";

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

### In API Context

```typescript
// packages/api/src/context.ts
import { auth } from "@verge/auth";

export async function createContext({ context }) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return { session };
}
```

## Auth API Methods

The `auth` instance provides:

```typescript
// Server-side session retrieval
auth.api.getSession({ headers })

// Request handler
auth.handler(request)
```

## Related

- [Authentication Overview](/api/authentication/) - Auth configuration
- [Payments Overview](/api/payments/) - Polar integration
- [@verge/db](/packages/db/) - Database package
