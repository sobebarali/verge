---
title: Payments Overview
description: Polar integration for subscription management
---

Verge uses Polar for payment processing and subscription management, integrated through Better-Auth.

## Source

### Polar Client

**Location**: `packages/auth/src/lib/payments.ts`

```typescript
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",  // Use "production" for live
});
```

### Better-Auth Integration

**Location**: `packages/auth/src/index.ts`

```typescript
import { polar, checkout, portal } from "@polar-sh/better-auth";

export const auth = betterAuth({
  // ...
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: "your-product-id",
              slug: "pro",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
```

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `createCustomerOnSignUp` | `true` | Creates Polar customer when user signs up |
| `enableCustomerPortal` | `true` | Enables customer portal access |
| `authenticatedUsersOnly` | `true` | Checkout requires authentication |

## Features

### Automatic Customer Creation

When a user signs up, a Polar customer is automatically created. This links the Verge user to a Polar customer for payment management.

### Checkout Flow

Users can purchase subscriptions through the checkout flow:

1. User clicks "Upgrade" or similar CTA
2. Redirect to Polar checkout with product slug
3. User completes payment on Polar
4. Redirect back to `POLAR_SUCCESS_URL`

### Customer Portal

Authenticated users can access the customer portal to:

- View subscription status
- Update payment method
- Cancel subscription
- View invoices

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POLAR_ACCESS_TOKEN` | Yes | Polar API access token |
| `POLAR_SUCCESS_URL` | Yes | Redirect URL after checkout |

## Sandbox vs Production

```typescript
// Sandbox (testing)
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

// Production (live)
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "production",
});
```

## Products

Products are configured in the checkout plugin:

```typescript
checkout({
  products: [
    {
      productId: "prod_xxx",  // Polar product ID
      slug: "pro",            // URL-friendly identifier
    },
  ],
});
```

## Sections

- [Checkout](/api/payments/checkout/) - Checkout flow details
- [Customer Portal](/api/payments/customer-portal/) - Portal access

## Related

- [Authentication](/api/authentication/) - User authentication
- [Better-Auth Polar Plugin](https://better-auth.com/docs/plugins/polar)
