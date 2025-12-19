---
title: Project Structure
description: Understanding the Verge monorepo structure
---

Verge is organized as a Turborepo monorepo with apps and shared packages.

## Directory Structure

```
verge/
├── apps/
│   ├── web/              # React frontend
│   ├── server/           # Hono API server
│   └── docs/             # Documentation (this site)
├── packages/
│   ├── api/              # tRPC routers and procedures
│   ├── auth/             # Better-Auth configuration
│   └── db/               # Mongoose models and connection
├── turbo.json            # Turborepo configuration
├── package.json          # Root package.json
└── tsconfig.json         # Base TypeScript config
```

## Apps

### apps/web

React frontend built with TanStack Router.

```
apps/web/
├── src/
│   ├── routes/           # File-based routes
│   ├── components/       # UI components
│   ├── utils/
│   │   └── trpc.ts       # tRPC client setup
│   └── main.tsx          # App entry point
├── package.json
└── vite.config.ts
```

**Key Dependencies:**
- `react` + `react-dom`
- `@tanstack/react-router`
- `@trpc/client` + `@trpc/tanstack-react-query`
- `tailwindcss`

### apps/server

Hono-based API server with tRPC integration.

```
apps/server/
├── src/
│   └── index.ts          # Server entry point
├── .env                  # Environment variables
└── package.json
```

**Key Dependencies:**
- `hono`
- `@hono/trpc-server`
- `@verge/api`
- `@verge/auth`

### apps/docs

Astro Starlight documentation site (you're reading it now).

```
apps/docs/
├── src/
│   └── content/
│       └── docs/         # Markdown/MDX documentation
├── astro.config.mjs
└── package.json
```

## Packages

### packages/api

tRPC router definitions and procedures.

```
packages/api/
└── src/
    ├── index.ts          # tRPC setup, procedures
    ├── context.ts        # Request context creation
    └── routers/
        └── index.ts      # App router definition
```

**Exports:**
- `router` - Router factory
- `publicProcedure` - Unauthenticated procedures
- `protectedProcedure` - Authenticated procedures
- `createContext` - Context factory
- `AppRouter` - Router type (for client)

### packages/auth

Better-Auth configuration with Polar payments.

```
packages/auth/
└── src/
    ├── index.ts          # Auth configuration
    └── lib/
        └── payments.ts   # Polar setup
```

**Exports:**
- `auth` - Better-Auth instance

### packages/db

Mongoose connection and model definitions.

```
packages/db/
└── src/
    ├── index.ts          # Database connection
    └── models/
        └── auth.model.ts # User, Session, Account, Verification
```

**Exports:**
- `client` - MongoDB client for Better-Auth adapter
- Model exports (User, Session, Account, Verification)

## Package Dependencies

```
                    ┌─────────────┐
                    │  apps/web   │
                    └──────┬──────┘
                           │ (type imports)
                           ▼
┌─────────────┐     ┌─────────────┐
│ apps/server │────▶│ @verge/api  │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │@verge/auth│ │ @verge/db │ │  (hono)  │
       └─────┬────┘ └──────────┘ └──────────┘
             │            ▲
             └────────────┘
```

## Turborepo Configuration

`turbo.json` defines the build pipeline:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Next Steps

- [Environment Variables](/getting-started/environment-variables/) - Configuration options
- [Architecture Overview](/architecture/) - System design
