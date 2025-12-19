---
title: Packages Overview
description: Shared packages in the Verge monorepo
---

Verge uses a monorepo structure with shared packages for code reuse across applications.

## Package Architecture

```
packages/
├── api/          # tRPC routers and procedures
├── auth/         # Better-Auth configuration
└── db/           # Mongoose models and connection
```

## Package Dependencies

| Package | Depends On | Used By |
|---------|------------|---------|
| `@verge/db` | - | `@verge/auth`, `@verge/api` |
| `@verge/auth` | `@verge/db` | `@verge/api`, `apps/server` |
| `@verge/api` | `@verge/auth`, `@verge/db` | `apps/server`, `apps/web` |

## Packages

### @verge/api

The API package contains tRPC router definitions and procedures.

- [Full Documentation](/packages/api/)
- **Location**: `packages/api/`
- **Exports**: `router`, `publicProcedure`, `protectedProcedure`, `createContext`

### @verge/auth

The auth package configures Better-Auth with MongoDB and Polar payments.

- [Full Documentation](/packages/auth/)
- **Location**: `packages/auth/`
- **Exports**: `auth`

### @verge/db

The database package manages Mongoose connection and model definitions.

- [Full Documentation](/packages/db/)
- **Location**: `packages/db/`
- **Exports**: `client`, models
