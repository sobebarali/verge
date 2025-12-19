---
title: Checkout
description: Polar checkout flow for subscriptions
---

The checkout flow allows authenticated users to purchase subscriptions.

## Configuration

Checkout is configured in the Polar plugin:

```typescript
// packages/auth/src/index.ts
checkout({
  products: [
    {
      productId: "your-product-id",  // From Polar dashboard
      slug: "pro",                    // URL identifier
    },
  ],
  successUrl: process.env.POLAR_SUCCESS_URL,
  authenticatedUsersOnly: true,
})
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `products` | Array | List of product configurations |
| `products[].productId` | String | Polar product ID |
| `products[].slug` | String | URL-friendly identifier |
| `successUrl` | String | Redirect URL after payment |
| `authenticatedUsersOnly` | Boolean | Require auth for checkout |

## Checkout Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│  Verge  │────▶│  Polar  │────▶│  Verge  │
│ Clicks  │     │ Redirect│     │Checkout │     │ Success │
│ Upgrade │     │ to Polar│     │  Page   │     │  Page   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Steps

1. **User initiates**: Clicks upgrade button
2. **Redirect to Polar**: User sent to Polar checkout
3. **Payment**: User completes payment on Polar
4. **Webhook**: Polar notifies Verge of successful payment
5. **Redirect**: User returned to success URL

## Initiating Checkout

### Client-Side

```typescript
import { authClient } from '@/lib/auth-client';

async function initiateCheckout() {
  // Redirect to checkout for "pro" product
  const { url } = await authClient.checkout({
    slug: 'pro',
  });

  if (url) {
    window.location.href = url;
  }
}
```

### Checkout Button Component

```typescript
function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const { url } = await authClient.checkout({ slug: 'pro' });
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </button>
  );
}
```

## Success Page

After successful payment, users are redirected to `POLAR_SUCCESS_URL`:

```typescript
// apps/web/src/routes/success.tsx
export function SuccessPage() {
  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for subscribing to Verge Pro.</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}
```

## Adding Products

To add a new product:

1. Create the product in Polar dashboard
2. Copy the product ID
3. Add to checkout configuration:

```typescript
checkout({
  products: [
    { productId: "prod_xxx", slug: "pro" },
    { productId: "prod_yyy", slug: "team" },  // New product
  ],
})
```

## Error Handling

```typescript
async function initiateCheckout() {
  try {
    const { url, error } = await authClient.checkout({ slug: 'pro' });

    if (error) {
      toast.error('Unable to start checkout');
      return;
    }

    window.location.href = url;
  } catch (error) {
    toast.error('Checkout failed. Please try again.');
  }
}
```

## Related

- [Payments Overview](/api/payments/) - Payment configuration
- [Customer Portal](/api/payments/customer-portal/) - Subscription management
