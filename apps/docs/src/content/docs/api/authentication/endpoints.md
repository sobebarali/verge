---
title: Auth Endpoints
description: Better-Auth API endpoints reference
---

Better-Auth exposes authentication endpoints at `/api/auth/*`.

## Base Path

All authentication endpoints are available at:

```
http://localhost:3000/api/auth/*
```

## Server Integration

The Hono server routes auth requests to Better-Auth:

```typescript
// apps/server/src/index.ts
import { auth } from "@verge/auth";

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
```

## Available Endpoints

### Sign Up

Create a new user account.

| Property | Value |
|----------|-------|
| **Path** | `/api/auth/sign-up/email` |
| **Method** | POST |
| **Auth** | None |

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "User Name"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "id": "session_123",
    "token": "...",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

### Sign In

Authenticate an existing user.

| Property | Value |
|----------|-------|
| **Path** | `/api/auth/sign-in/email` |
| **Method** | POST |
| **Auth** | None |

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as sign-up, plus session cookie set.

### Sign Out

End the current session.

| Property | Value |
|----------|-------|
| **Path** | `/api/auth/sign-out` |
| **Method** | POST |
| **Auth** | Session cookie |

**Response:**

```json
{
  "success": true
}
```

### Get Session

Retrieve current session information.

| Property | Value |
|----------|-------|
| **Path** | `/api/auth/get-session` |
| **Method** | GET |
| **Auth** | Session cookie |

**Response:**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid request body |
| 401 | Invalid credentials or session |
| 409 | Email already exists (sign-up) |
| 500 | Server error |

**Error Format:**

```json
{
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

## cURL Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }' \
  -c cookies.txt
```

### Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Get Session

```bash
curl http://localhost:3000/api/auth/get-session \
  -b cookies.txt
```

### Sign Out

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

## Related

- [Email & Password](/api/authentication/email-password/) - Auth flow details
- [Session Management](/api/authentication/session-management/) - Cookie handling
- [Client Integration](/api/authentication/client-integration/) - React setup
