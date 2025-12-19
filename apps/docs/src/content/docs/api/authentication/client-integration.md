---
title: Client Integration
description: Setting up the Better-Auth client in React
---

This guide covers integrating Better-Auth with the React frontend.

## Auth Client Setup

Create the auth client in your web app:

```typescript
// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});
```

## Environment Variable

Set the server URL in your web app environment:

```bash
# apps/web/.env
VITE_SERVER_URL="http://localhost:3000"
```

## Authentication Methods

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
    // Handle error
    console.error(error.message);
    return;
  }

  // User is now signed up and signed in
  console.log('Welcome,', data.user.name);
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
    console.error(error.message);
    return;
  }

  console.log('Signed in as', data.user.email);
}
```

### Sign Out

```typescript
import { authClient } from '@/lib/auth-client';

async function handleSignOut() {
  await authClient.signOut();
  // Redirect to login page
}
```

### Get Session

```typescript
import { authClient } from '@/lib/auth-client';

async function getCurrentUser() {
  const session = await authClient.getSession();

  if (!session) {
    return null;
  }

  return session.user;
}
```

## React Hooks

### useSession Hook

Create a custom hook for session management:

```typescript
// apps/web/src/hooks/useSession.ts
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

  return { session, loading };
}
```

### Usage in Components

```typescript
import { useSession } from '@/hooks/useSession';

function UserProfile() {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

## Protected Routes

Protect routes that require authentication:

```typescript
// apps/web/src/components/ProtectedRoute.tsx
import { Navigate } from '@tanstack/react-router';
import { useSession } from '@/hooks/useSession';

export function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

## Login Form Example

Complete login form with error handling:

```typescript
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate({ to: '/dashboard' });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

## Combining with tRPC

Use the authenticated session with tRPC:

```typescript
// The tRPC client automatically includes cookies
import { trpc } from '@/utils/trpc';

async function fetchUserData() {
  // This will include the session cookie automatically
  const data = await trpc.privateData.query();
  return data.user;
}
```

## Related

- [Endpoints](/api/authentication/endpoints/) - Auth API routes
- [Session Management](/api/authentication/session-management/) - Cookie handling
- [tRPC Client](/api/trpc/) - Type-safe API calls
