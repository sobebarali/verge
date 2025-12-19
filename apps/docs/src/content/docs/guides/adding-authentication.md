---
title: Adding Authentication
description: How to protect routes and access user data
---

This guide covers how to add authentication to your tRPC endpoints and React components.

## Server-Side: Protected Endpoints

### Using protectedProcedure

Use `protectedProcedure` for endpoints that require authentication:

```typescript
// packages/api/src/routers/index.ts
import { protectedProcedure, router } from "../index";

export const appRouter = router({
  // This endpoint requires authentication
  getMyProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.session is guaranteed to exist
    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
      name: ctx.session.user.name,
    };
  }),
});
```

### Accessing User Data

In protected procedures, access user info via `ctx.session`:

```typescript
protectedProcedure.query(({ ctx }) => {
  const userId = ctx.session.user.id;
  const userEmail = ctx.session.user.email;
  const userName = ctx.session.user.name;

  // Use these to fetch user-specific data
  return MyModel.find({ userId });
})
```

### Checking Ownership

Always verify resource ownership:

```typescript
deleteProject: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const project = await Project.findById(input.projectId);

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Verify ownership
    if (project.userId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this project",
      });
    }

    await project.deleteOne();
    return { success: true };
  }),
```

## Client-Side: Auth State

### Setting Up Auth Client

```typescript
// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});
```

### useSession Hook

Create a hook to access session state:

```typescript
// apps/web/src/hooks/useSession.ts
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session,
    user: session?.user,
  };
}
```

### Usage in Components

```typescript
function Dashboard() {
  const { session, loading, isAuthenticated, user } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

## Protected Routes

### Route Guard Component

```typescript
// apps/web/src/components/ProtectedRoute.tsx
import { Navigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

### Using the Guard

```typescript
// In your route definition
function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

## Authentication Actions

### Sign In

```typescript
import { authClient } from "@/lib/auth-client";

async function handleSignIn(email: string, password: string) {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
    return;
  }

  // Redirect to dashboard
  navigate("/dashboard");
}
```

### Sign Up

```typescript
async function handleSignUp(email: string, password: string, name: string) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
  });

  if (error) {
    toast.error(error.message);
    return;
  }

  // User is automatically signed in
  navigate("/dashboard");
}
```

### Sign Out

```typescript
async function handleSignOut() {
  await authClient.signOut();
  navigate("/");
}
```

## Handling Auth Errors in tRPC

### Client-Side Error Handling

```typescript
import { TRPCClientError } from "@trpc/client";

async function fetchProtectedData() {
  try {
    const data = await trpc.getMyProfile.query();
    return data;
  } catch (error) {
    if (error instanceof TRPCClientError) {
      if (error.data?.code === "UNAUTHORIZED") {
        // Redirect to login
        navigate("/login");
        return;
      }
    }
    throw error;
  }
}
```

### Global Error Handler

```typescript
// In your tRPC setup
import { toast } from "sonner";

// Handle errors globally in React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError) {
          if (error.data?.code === "UNAUTHORIZED") {
            return false; // Don't retry auth errors
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          toast.error(error.message);
        }
      },
    },
  },
});
```

## Complete Example: Protected Dashboard

```typescript
// apps/web/src/routes/dashboard.tsx
import { useSession } from "@/hooks/useSession";
import { trpc } from "@/utils/trpc";
import { Navigate } from "@tanstack/react-router";

export function DashboardPage() {
  const { loading, isAuthenticated, user } = useSession();

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <DashboardContent user={user} />;
}

function DashboardContent({ user }) {
  // Fetch user's projects using protected endpoint
  const { data: projects, isLoading } = trpc.listProjects.useQuery();

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>

      <h2>Your Projects</h2>
      <ul>
        {projects?.map((project) => (
          <li key={project._id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Related

- [Procedures](/api/trpc/procedures/) - Public vs protected procedures
- [Session Management](/api/authentication/session-management/) - How sessions work
- [Client Integration](/api/authentication/client-integration/) - Auth client setup
