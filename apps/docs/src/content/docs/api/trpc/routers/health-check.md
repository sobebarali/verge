---
title: healthCheck
description: API health check endpoint
---

The `healthCheck` endpoint verifies that the API server is running and responsive.

## Endpoint Details

| Property | Value |
|----------|-------|
| **Name** | `healthCheck` |
| **Type** | Query |
| **Authentication** | Public (none required) |
| **Source** | `packages/api/src/routers/index.ts` |

## Implementation

```typescript
// packages/api/src/routers/index.ts
import { publicProcedure, router } from "../index";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
});
```

## Input

This endpoint requires no input parameters.

## Output

| Field | Type | Description |
|-------|------|-------------|
| (response) | `string` | Always returns `"OK"` |

```typescript
type Output = "OK";
```

## Errors

This endpoint does not throw errors under normal conditions.

## Usage Examples

### React (tRPC Client)

```typescript
import { trpc } from '@/utils/trpc';

// Using the tRPC proxy
const health = await trpc.healthCheck.query();
console.log(health); // "OK"
```

### React Query Hook

```typescript
import { trpc } from '@/utils/trpc';

function HealthStatus() {
  const { data, isLoading, error } = trpc.healthCheck.useQuery();

  if (isLoading) return <span>Checking...</span>;
  if (error) return <span>API Down</span>;
  return <span>API: {data}</span>;
}
```

### cURL

```bash
curl -X POST http://localhost:3000/trpc/healthCheck \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: {"result":{"data":"OK"}}
```

### Fetch API

```typescript
const response = await fetch('http://localhost:3000/trpc/healthCheck', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});

const data = await response.json();
console.log(data.result.data); // "OK"
```

## Use Cases

1. **Load balancer health checks**: Configure your load balancer to ping this endpoint
2. **Monitoring**: Set up uptime monitoring with services like UptimeRobot
3. **Deployment verification**: Check API is running after deployment
4. **Client connectivity test**: Verify client can reach the server

## Related

- [API Overview](/api/) - All available endpoints
- [privateData](/api/trpc/routers/private-data/) - Protected endpoint example
