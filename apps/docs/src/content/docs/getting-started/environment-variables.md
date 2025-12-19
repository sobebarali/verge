---
title: Environment Variables
description: Required and optional environment variables for Verge
---

This page documents all environment variables used by Verge.

## Server Environment Variables

Location: `apps/server/.env`

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/verge` |
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:3001` |

### Payment Variables (Polar)

| Variable | Description | Example |
|----------|-------------|---------|
| `POLAR_ACCESS_TOKEN` | Polar API access token | `polar_at_xxx` |
| `POLAR_SUCCESS_URL` | Redirect URL after checkout | `http://localhost:3001/success` |

## Example Configuration

### Development

```bash
# apps/server/.env

# Database
DATABASE_URL="mongodb://localhost:27017/verge"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Polar (Payments)
POLAR_ACCESS_TOKEN="your-sandbox-token"
POLAR_SUCCESS_URL="http://localhost:3001/success"
```

### Production

```bash
# apps/server/.env

# Database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/verge"

# CORS
CORS_ORIGIN="https://app.verge.io"

# Polar (Payments)
POLAR_ACCESS_TOKEN="your-production-token"
POLAR_SUCCESS_URL="https://app.verge.io/success"
```

## Web Environment Variables

Location: `apps/web/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | API server URL | `http://localhost:3000` |

### Example

```bash
# apps/web/.env
VITE_SERVER_URL="http://localhost:3000"
```

## Variable Usage

### In Server Code

```typescript
// Access via process.env
const dbUrl = process.env.DATABASE_URL;
const corsOrigin = process.env.CORS_ORIGIN;
```

### In Web Code

```typescript
// Access via import.meta.env (Vite)
const serverUrl = import.meta.env.VITE_SERVER_URL;
```

## Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use `.env.example`** - Document required variables without values
3. **Rotate tokens** - Change Polar tokens if exposed
4. **Use cloud secrets** - In production, use secret management services

## Related

- [Installation](/getting-started/installation/) - Setup guide
- [Project Structure](/getting-started/project-structure/) - Where env files live
