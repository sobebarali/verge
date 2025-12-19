---
title: privateData
description: Protected endpoint returning authenticated user data
---

The `privateData` endpoint returns information about the currently authenticated user. It requires a valid session.

## Endpoint Details

| Property | Value |
|----------|-------|
| **Name** | `privateData` |
| **Type** | Query |
| **Authentication** | Protected (session required) |
| **Source** | `packages/api/src/routers/index.ts` |

## Implementation

```typescript
// packages/api/src/routers/index.ts
import { protectedProcedure, router } from "../index";

export const appRouter = router({
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
```

## Input

This endpoint requires no input parameters.

## Output

```typescript
type Output = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | `string` | Static message `"This is private"` |
| `user` | `User` | Authenticated user object |
| `user.id` | `string` | User's unique identifier |
| `user.email` | `string` | User's email address |
| `user.name` | `string` | User's display name |
| `user.emailVerified` | `boolean` | Whether email is verified |
| `user.image` | `string?` | Optional profile image URL |
| `user.createdAt` | `Date` | Account creation timestamp |
| `user.updatedAt` | `Date` | Last update timestamp |

## Errors

| Error Code | Message | Cause |
|------------|---------|-------|
| `UNAUTHORIZED` | `"Authentication required"` | No valid session cookie |

## Usage Examples

### React (tRPC Client)

```typescript
import { trpc } from '@/utils/trpc';

// Requires authenticated session
const data = await trpc.privateData.query();
console.log(data.user.email);
```

### React Query Hook with Error Handling

```typescript
import { trpc } from '@/utils/trpc';
import { useNavigate } from '@tanstack/react-router';

function UserProfile() {
  const navigate = useNavigate();

  const { data, isLoading, error } = trpc.privateData.useQuery(undefined, {
    retry: false,
    onError: (err) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        navigate({ to: '/login' });
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {data.user.name}</h1>
      <p>Email: {data.user.email}</p>
    </div>
  );
}
```

### cURL (with session cookie)

```bash
# First, sign in to get a session cookie
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  -c cookies.txt

# Then, use the cookie for authenticated requests
curl -X POST http://localhost:3000/trpc/privateData \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'

# Response:
# {
#   "result": {
#     "data": {
#       "message": "This is private",
#       "user": {
#         "id": "...",
#         "email": "user@example.com",
#         "name": "User Name",
#         ...
#       }
#     }
#   }
# }
```

### Error Response (Unauthenticated)

```json
{
  "error": {
    "message": "Authentication required",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "privateData"
    }
  }
}
```

## Client-Side Authentication Check

Use this endpoint to verify if the user is still authenticated:

```typescript
async function checkAuth(): Promise<boolean> {
  try {
    await trpc.privateData.query();
    return true;
  } catch {
    return false;
  }
}
```

## Related

- [healthCheck](/api/trpc/routers/health-check/) - Public endpoint example
- [Procedures](/api/trpc/procedures/) - Public vs protected procedures
- [Session Management](/api/authentication/session-management/) - How sessions work
