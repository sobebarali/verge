---
title: Testing Locally
description: Local development workflow and testing
---

This guide covers the local development workflow for Verge.

## Starting the Development Environment

### 1. Start MongoDB

If using local MongoDB:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or run directly
mongod --dbpath /path/to/data
```

### 2. Set Environment Variables

```bash
# apps/server/.env
DATABASE_URL="mongodb://localhost:27017/verge"
CORS_ORIGIN="http://localhost:3001"
POLAR_ACCESS_TOKEN="your-sandbox-token"
POLAR_SUCCESS_URL="http://localhost:3001/success"
```

### 3. Start Development Servers

```bash
# Start all apps
npm run dev

# Or start individually
npm run dev:server  # API at http://localhost:3000
npm run dev:web     # Web at http://localhost:3001
```

## Testing API Endpoints

### Health Check

```bash
curl http://localhost:3000
# Expected: "OK"
```

### tRPC Endpoints

```bash
# Public endpoint
curl -X POST http://localhost:3000/trpc/healthCheck \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: {"result":{"data":"OK"}}
```

### Authentication Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }' \
  -c cookies.txt

# 2. Sign in (if already have account)
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# 3. Access protected endpoint
curl -X POST http://localhost:3000/trpc/privateData \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'

# 4. Sign out
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

## Database Operations

### View Database Contents

```bash
# Using MongoDB shell
mongosh

# Select database
use myDB

# List collections
show collections

# View users
db.user.find()

# View sessions
db.session.find()
```

### Database Studio

Verge includes a database studio script:

```bash
npm run db:studio
```

Or use MongoDB Compass for a GUI.

## Testing React Components

### Manual Testing

1. Start the development servers
2. Open http://localhost:3001
3. Navigate through the app
4. Check browser console for errors

### Testing Auth Flow

1. Go to signup page
2. Create a new account
3. Verify redirect to dashboard
4. Check that protected routes work
5. Sign out and verify redirect

## Debugging

### Server Logs

The Hono server logs requests:

```
GET / 200 1ms
POST /trpc/healthCheck 200 5ms
POST /api/auth/sign-in/email 200 120ms
```

### tRPC Errors

Client-side tRPC errors include:

```javascript
{
  message: "Authentication required",
  data: {
    code: "UNAUTHORIZED",
    httpStatus: 401,
    path: "privateData"
  }
}
```

### MongoDB Connection Issues

Check logs for:

```
Error connecting to database: MongoNetworkError...
```

Verify:
1. MongoDB is running
2. Connection string is correct
3. Database exists

## Hot Reloading

### Server

Changes to server code trigger automatic reload:

- `apps/server/src/**`
- `packages/api/src/**`
- `packages/auth/src/**`
- `packages/db/src/**`

### Web

Vite provides hot module replacement:

- Component changes update instantly
- State is preserved when possible

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### CORS Errors

Ensure `CORS_ORIGIN` matches your frontend URL:

```bash
CORS_ORIGIN="http://localhost:3001"
```

### Cookie Issues

For local development:
- Both apps should use `localhost` (not `127.0.0.1`)
- Check cookie settings in browser DevTools

### TypeScript Errors

Run type checking:

```bash
npm run check-types
```

## Testing Checklist

Before committing changes:

- [ ] API health check works
- [ ] Auth flow (signup, signin, signout) works
- [ ] Protected endpoints require authentication
- [ ] Database operations work correctly
- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run check-types`)
- [ ] Code passes linting (`npm run check`)

## Related

- [Installation](/getting-started/installation/) - Setup guide
- [Environment Variables](/getting-started/environment-variables/) - Configuration
- [Project Structure](/getting-started/project-structure/) - Codebase layout
