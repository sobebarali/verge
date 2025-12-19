---
title: Customer Portal
description: Polar customer portal for subscription management
---

The customer portal allows users to manage their subscriptions, update payment methods, and view invoices.

## Configuration

The portal is enabled via the Polar plugin:

```typescript
// packages/auth/src/index.ts
polar({
  client: polarClient,
  enableCustomerPortal: true,
  use: [
    // ...
    portal(),
  ],
})
```

## Portal Features

| Feature | Description |
|---------|-------------|
| View subscription | See current plan and status |
| Update payment | Change credit card or payment method |
| Cancel subscription | End current subscription |
| View invoices | Access billing history |
| Reactivate | Resume cancelled subscription |

## Accessing the Portal

### Client-Side

```typescript
import { authClient } from '@/lib/auth-client';

async function openPortal() {
  const { url } = await authClient.customerPortal();

  if (url) {
    window.location.href = url;
  }
}
```

### Portal Button Component

```typescript
function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await authClient.customerPortal();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Unable to open portal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

## Portal Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│  Verge  │────▶│  Polar  │────▶│  Verge  │
│ Clicks  │     │  Get    │     │ Portal  │     │ Return  │
│ Manage  │     │  URL    │     │  Page   │     │  Page   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Steps

1. User clicks "Manage Subscription"
2. Verge requests portal URL from Polar
3. User redirected to Polar customer portal
4. User makes changes (update payment, cancel, etc.)
5. User returns to Verge

## Account Settings Integration

Example integration in account settings:

```typescript
function AccountSettings() {
  const { session } = useSession();

  return (
    <div>
      <h2>Account Settings</h2>

      <section>
        <h3>Profile</h3>
        <p>Email: {session.user.email}</p>
        <p>Name: {session.user.name}</p>
      </section>

      <section>
        <h3>Subscription</h3>
        <ManageSubscriptionButton />
      </section>
    </div>
  );
}
```

## Error Handling

```typescript
async function openPortal() {
  try {
    const { url, error } = await authClient.customerPortal();

    if (error) {
      // User might not have a subscription
      toast.error('No active subscription found');
      return;
    }

    window.location.href = url;
  } catch (error) {
    toast.error('Unable to open portal. Please try again.');
  }
}
```

## Related

- [Payments Overview](/api/payments/) - Payment configuration
- [Checkout](/api/payments/checkout/) - Purchase flow
