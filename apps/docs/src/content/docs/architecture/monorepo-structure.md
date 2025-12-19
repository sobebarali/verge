---
title: Monorepo Structure
description: Understanding the Turborepo workspace organization
---

Verge uses Turborepo for monorepo management, enabling efficient builds and shared code.

## Workspace Configuration

Root `package.json` defines the workspaces:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## Turborepo Pipeline

`turbo.json` configures the build pipeline:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "check-types": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Pipeline Explanation

| Task | Description | Dependencies |
|------|-------------|--------------|
| `build` | Production build | All dependency packages must build first (`^build`) |
| `dev` | Development mode | No caching, runs persistently |
| `check-types` | TypeScript check | Depends on package builds |

## Package Organization

### Apps (Deployable)

| App | Purpose | Port |
|-----|---------|------|
| `apps/web` | React frontend | 3001 |
| `apps/server` | Hono API | 3000 |
| `apps/docs` | Documentation | 4321 |

### Packages (Shared Libraries)

| Package | Purpose | Consumers |
|---------|---------|-----------|
| `@verge/api` | tRPC definitions | `apps/server`, `apps/web` |
| `@verge/auth` | Authentication | `apps/server`, `@verge/api` |
| `@verge/db` | Database layer | `@verge/auth`, `@verge/api` |

## Dependency Graph

```
apps/web ─────────────────────┐
    │                         │
    │ (type imports only)     │
    ▼                         │
apps/server ─────▶ @verge/api │
    │                  │      │
    │                  │      │
    ▼                  ▼      │
@verge/auth ─────▶ @verge/db ◀┘
```

## Build Order

When running `npm run build`, Turborepo builds in dependency order:

1. `@verge/db` (no dependencies)
2. `@verge/auth` (depends on `@verge/db`)
3. `@verge/api` (depends on `@verge/auth`, `@verge/db`)
4. `apps/server` (depends on `@verge/api`, `@verge/auth`)
5. `apps/web` (depends on `@verge/api` types)
6. `apps/docs` (no package dependencies)

## Package References

Each package uses TypeScript project references:

```json
// apps/server/tsconfig.json
{
  "references": [
    { "path": "../../packages/api" },
    { "path": "../../packages/auth" }
  ]
}
```

## Common Commands

```bash
# Build all packages and apps
npm run build

# Start all in development
npm run dev

# Start specific apps
npm run dev:web      # Only web app
npm run dev:server   # Only server

# Type check all
npm run check-types

# Lint and format
npm run check
```

## Adding a New Package

1. Create package directory:
   ```bash
   mkdir packages/my-package
   cd packages/my-package
   npm init
   ```

2. Add to workspace (automatic via glob)

3. Add TypeScript config:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist"
     }
   }
   ```

4. Reference from consuming packages

## Related

- [Data Flow](/architecture/data-flow/) - Request lifecycle
- [Technology Decisions](/architecture/technology-decisions/) - Why these choices
