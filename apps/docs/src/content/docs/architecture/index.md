---
title: Architecture Overview
description: High-level system architecture and design decisions
---

This section covers the system architecture, data flow, and technology decisions for Verge.

## System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Web     │────▶│   Hono Server   │────▶│    MongoDB      │
│   (TanStack)    │     │   (tRPC)        │     │   (Mongoose)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ├───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Auth Client    │────▶│  Better-Auth    │     │  Firecrawl API  │
│  (React)        │     │  + Polar        │     │  (Web Scraping) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Python Agents  │
                        │  (OpenAI SDK)   │
                        └─────────────────┘
```

## Package Dependencies

```
apps/web ──────▶ @verge/api (type imports)
                     │
                     ├──▶ @verge/auth
                     │         │
                     │         └──▶ @verge/db
                     │
                     └──▶ @verge/db

apps/server ───▶ @verge/api
                     │
                     └──▶ @verge/auth
```

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Web App | `apps/web/` | React frontend with TanStack Router |
| Server | `apps/server/` | Hono HTTP server with tRPC integration |
| Agents Service | `apps/agents/` | Python AI agents (OpenAI Agents SDK) |
| API Package | `packages/api/` | tRPC routers and procedures |
| Auth Package | `packages/auth/` | Better-Auth configuration |
| DB Package | `packages/db/` | Mongoose models and connection |

## External Services

| Service | Purpose |
|---------|---------|
| Firecrawl | Web scraping and LLM-powered data extraction |
| OpenAI | LLM provider for agents and extraction |
| MongoDB Atlas | Database hosting |
| Polar | Payment processing |

## Sections

- [Monorepo Structure](/architecture/monorepo-structure/) - Turborepo workspace layout
- [Data Flow](/architecture/data-flow/) - Request lifecycle from client to database
- [Technology Decisions](/architecture/technology-decisions/) - Why we chose each technology
