---
title: Email & Password Authentication
description: Email and password authentication flow
---

Verge supports email and password authentication via Better-Auth.

## Configuration

Email/password auth is enabled in the Better-Auth configuration:

```typescript
// packages/auth/src/index.ts
export const auth = betterAuth({
  // ...
  emailAndPassword: {
    enabled: true,
  },
});
```

## Registration Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Client  │────▶│ Server  │────▶│ MongoDB │
│         │     │         │     │         │     │         │
│  Form   │     │ signUp  │     │ Better  │     │  user   │
│  Submit │     │  ()     │     │  Auth   │     │ account │
│         │     │         │     │         │     │ session │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Steps

1. User submits registration form
2. Client calls `authClient.signUp.email()`
3. Better-Auth validates input
4. Creates user in `user` collection
5. Creates account in `account` collection
6. Creates session in `session` collection
7. Sets session cookie
8. Returns user and session data

## Login Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Client  │────▶│ Server  │────▶│ MongoDB │
│         │     │         │     │         │     │         │
│  Login  │     │ signIn  │     │ Better  │     │ account │
│  Form   │     │  ()     │     │  Auth   │     │  check  │
│         │     │         │     │ validate│     │ session │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Steps

1. User submits login form
2. Client calls `authClient.signIn.email()`
3. Better-Auth finds account by email
4. Validates password hash
5. Creates new session
6. Sets session cookie
7. Returns user and session data

## Password Storage

Passwords are securely hashed before storage:

- **Algorithm**: bcrypt (Better-Auth default)
- **Stored in**: `account.password` field
- **Never stored**: Plain text passwords

## Client Usage

### Sign Up

```typescript
import { authClient } from '@/lib/auth-client';

async function handleSignUp(email: string, password: string, name: string) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
  });

  if (error) {
    console.error('Sign up failed:', error.message);
    return;
  }

  console.log('Signed up:', data.user);
  // Redirect to dashboard
}
```

### Sign In

```typescript
import { authClient } from '@/lib/auth-client';

async function handleSignIn(email: string, password: string) {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    console.error('Sign in failed:', error.message);
    return;
  }

  console.log('Signed in:', data.user);
  // Redirect to dashboard
}
```

## Validation

Better-Auth performs these validations:

| Field | Validation |
|-------|------------|
| Email | Valid email format, unique |
| Password | Minimum length (configurable) |
| Name | Required on sign-up |

## Error Handling

| Error Code | Description | User Message |
|------------|-------------|--------------|
| `INVALID_EMAIL` | Invalid email format | "Please enter a valid email" |
| `USER_EXISTS` | Email already registered | "Account already exists" |
| `INVALID_CREDENTIALS` | Wrong password | "Invalid email or password" |
| `USER_NOT_FOUND` | Email not registered | "Invalid email or password" |

```typescript
const { error } = await authClient.signIn.email({ email, password });

if (error) {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      toast.error('Invalid email or password');
      break;
    default:
      toast.error('Something went wrong');
  }
}
```

## Security Considerations

1. **Rate limiting**: Consider adding rate limiting to prevent brute force
2. **Password requirements**: Configure minimum password strength
3. **Email verification**: Enable email verification for production
4. **HTTPS only**: Always use HTTPS in production

## Related

- [Endpoints](/api/authentication/endpoints/) - API routes
- [Session Management](/api/authentication/session-management/) - Session handling
- [User Model](/database/models/user/) - User schema
- [Account Model](/database/models/account/) - Account schema
