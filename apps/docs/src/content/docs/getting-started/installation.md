---
title: Installation
description: Step-by-step installation guide for Verge development environment
---

This guide walks you through setting up Verge for local development.

## Prerequisites

### Required

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v18+ | Required for npm |
| npm | v9+ | Package manager |
| MongoDB | v6+ | Local or cloud (Atlas) |

### Optional

| Requirement | Version | Notes |
|-------------|---------|-------|
| Bun | v1.0+ | Faster runtime alternative |

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/verge.git
cd verge
```

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces:
- `apps/web`
- `apps/server`
- `apps/docs`
- `packages/api`
- `packages/auth`
- `packages/db`

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` with your configuration:

```bash
DATABASE_URL="mongodb://localhost:27017/verge"
CORS_ORIGIN="http://localhost:3001"
POLAR_ACCESS_TOKEN="your-polar-token"
POLAR_SUCCESS_URL="http://localhost:3001/success"
```

See [Environment Variables](/getting-started/environment-variables/) for complete documentation.

### 4. Set Up Database

Ensure MongoDB is running, then push the schema:

```bash
npm run db:push
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- **Web app**: http://localhost:3001
- **API server**: http://localhost:3000

## Verify Installation

### Check API Health

```bash
curl http://localhost:3000
# Expected: "OK"
```

### Check Web App

Open http://localhost:3001 in your browser.

## Troubleshooting

### MongoDB Connection Failed

Ensure MongoDB is running:

```bash
# macOS with Homebrew
brew services start mongodb-community

# or start manually
mongod --dbpath /path/to/data
```

### Port Already in Use

Check which process is using the port:

```bash
lsof -i :3000  # Check API port
lsof -i :3001  # Check web port
```

Kill the process or use different ports via environment variables.

## Next Steps

- [Project Structure](/getting-started/project-structure/) - Understand the codebase layout
- [Environment Variables](/getting-started/environment-variables/) - Configure all options
- [Architecture Overview](/architecture/) - Learn the system design
