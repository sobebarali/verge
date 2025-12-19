---
title: Getting Started
description: Quick start guide for Verge development
---

Welcome to the Verge internal documentation. This guide will help you set up your local development environment and understand the project structure.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or cloud instance)
- **Bun** (optional, for faster runtime)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/verge.git
cd verge

# Install dependencies
npm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
# Edit .env with your MongoDB URI and other config

# Push database schema
npm run db:push

# Start development servers
npm run dev
```

After running these commands:
- Web app is available at `http://localhost:3001`
- API server is running at `http://localhost:3000`

## Next Steps

- [Installation](/getting-started/installation/) - Detailed setup instructions
- [Project Structure](/getting-started/project-structure/) - Understand the monorepo layout
- [Environment Variables](/getting-started/environment-variables/) - Required configuration
- [Architecture Overview](/architecture/) - System design and data flow
