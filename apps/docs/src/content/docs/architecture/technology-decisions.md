---
title: Technology Decisions
description: Rationale behind Verge's technology choices
---

This page explains why specific technologies were chosen for Verge.

## Server Framework: Hono

**Choice**: Hono over Express, Fastify, or Nest.js

**Rationale**:
- **Lightweight**: ~14kb, minimal overhead
- **Edge-ready**: Designed for edge runtimes (Cloudflare Workers, Vercel Edge)
- **TypeScript-first**: Excellent type inference
- **Middleware ecosystem**: Easy integration with tRPC
- **Performance**: Faster than Express in benchmarks

```typescript
// Clean, minimal API
const app = new Hono();
app.get('/', (c) => c.text('Hello Hono!'));
```

## API Layer: tRPC

**Choice**: tRPC over REST or GraphQL

**Rationale**:
- **End-to-end type safety**: Types flow from server to client
- **No code generation**: Unlike GraphQL, no build step for types
- **Simple RPC model**: Cleaner than REST for internal APIs
- **React Query integration**: Built-in caching and state management
- **Small bundle**: Lighter than Apollo Client

```typescript
// Type-safe from definition to consumption
const result = await trpc.healthCheck.query();
// result is typed as "OK"
```

## Authentication: Better-Auth

**Choice**: Better-Auth over NextAuth, Lucia, or custom auth

**Rationale**:
- **Framework agnostic**: Works with any server framework
- **MongoDB adapter**: Native MongoDB support
- **Plugin system**: Easy to add Polar payments
- **Type-safe sessions**: Full TypeScript support
- **Batteries included**: Email/password, OAuth, sessions out of the box

```typescript
// Simple configuration
const auth = betterAuth({
  database: mongodbAdapter(client),
  emailAndPassword: { enabled: true },
});
```

## Database: MongoDB + Mongoose

**Choice**: MongoDB over PostgreSQL, MySQL

**Rationale**:
- **Schema flexibility**: Easy to iterate on data models
- **JSON-native**: Natural fit for JavaScript/TypeScript
- **Mongoose ODM**: Type-safe queries and validation
- **Atlas**: Managed hosting with free tier
- **Better-Auth compatibility**: Native adapter available

```typescript
// Type-safe schema definitions
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
});
```

## Payments: Polar

**Choice**: Polar over Stripe, Paddle, or LemonSqueezy

**Rationale**:
- **Developer-focused**: Built for SaaS products
- **Better-Auth plugin**: Native integration
- **Simple pricing**: Straightforward fee structure
- **Customer portal**: Built-in subscription management
- **Sandbox mode**: Easy testing

## Build System: Turborepo

**Choice**: Turborepo over Nx, Lerna, or npm workspaces alone

**Rationale**:
- **Caching**: Build artifacts cached locally and remotely
- **Parallelization**: Runs independent tasks concurrently
- **Simple config**: Less complex than Nx
- **Vercel integration**: Native support on Vercel
- **Pipeline definition**: Clear task dependencies

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

## Frontend: TanStack Router

**Choice**: TanStack Router over React Router, Next.js

**Rationale**:
- **Type-safe routing**: Full TypeScript inference
- **File-based routes**: Convention over configuration
- **Data loading**: Built-in loaders with Suspense
- **Search params**: Type-safe URL parameters
- **No framework lock-in**: Just React

```typescript
// Fully typed route parameters
const { userId } = Route.useParams();
// userId is typed as string
```

## Styling: TailwindCSS + shadcn/ui

**Choice**: Tailwind over CSS Modules, styled-components

**Rationale**:
- **Utility-first**: Rapid prototyping
- **No context switching**: Styles in markup
- **Small bundle**: Purges unused styles
- **shadcn/ui**: Copy-paste components, full control
- **Accessibility**: shadcn components are accessible by default

## Linting/Formatting: Biome

**Choice**: Biome over ESLint + Prettier

**Rationale**:
- **All-in-one**: Linting and formatting combined
- **Performance**: Significantly faster than ESLint
- **Zero config**: Sensible defaults
- **Rust-based**: Fast and memory efficient

```bash
# Single command for everything
npm run check
```

## Runtime: Bun (Optional)

**Choice**: Bun as optional alternative to Node.js

**Rationale**:
- **Performance**: Faster startup and execution
- **Native TypeScript**: No transpilation needed
- **npm compatible**: Drop-in replacement
- **Built-in bundler**: Can replace esbuild/webpack

## Web Scraping: Firecrawl

**Choice**: Firecrawl over Puppeteer, Playwright, or custom scraping

**Rationale**:
- **LLM-ready output**: Converts websites to clean markdown
- **Built-in AI extraction**: Schema-based structured data extraction
- **JavaScript rendering**: Handles dynamic SPAs automatically
- **Anti-bot handling**: Manages retries, proxies, and blocks
- **TypeScript SDK**: Native Zod schema support

```typescript
// Schema-based extraction with Zod
import Firecrawl from '@mendable/firecrawl-js';
import { z } from 'zod';

const schema = z.object({
  companyName: z.string(),
  pricing: z.array(z.object({
    tier: z.string(),
    price: z.number(),
  })),
});

const result = await firecrawl.extract({
  urls: ['https://example.com'],
  schema,
  prompt: 'Extract company name and pricing tiers',
});
```

## AI Agents: OpenAI Agents SDK

**Choice**: OpenAI Agents SDK (Python) over LangChain, custom agents

**Rationale**:
- **Official OpenAI support**: First-party SDK from OpenAI
- **Multi-agent workflows**: Handoffs between specialized agents
- **Function tools**: Easy Python function → LLM tool conversion
- **Guardrails**: Built-in input/output validation
- **Mature Python SDK**: More feature-complete than JS alternatives

```python
# Natural language → Database query agent
from agents import Agent, function_tool

@function_tool
def query_scraped_data(query: str) -> str:
    """Execute a database query on scraped data"""
    # Agent parses natural language → MongoDB query
    return execute_mongo_query(query)

agent = Agent(
    name="Query Assistant",
    instructions="Convert natural language to database queries",
    tools=[query_scraped_data],
)
```

**Note**: Runs as a separate Python microservice (`apps/agents/`) communicating with the main server via HTTP.

## Summary Table

| Category | Choice | Alternative Considered |
|----------|--------|----------------------|
| Server | Hono | Express, Fastify |
| API | tRPC | REST, GraphQL |
| Auth | Better-Auth | NextAuth, Lucia |
| Database | MongoDB | PostgreSQL |
| Payments | Polar | Stripe |
| Build | Turborepo | Nx |
| Router | TanStack Router | React Router |
| Styling | Tailwind + shadcn | CSS Modules |
| Lint/Format | Biome | ESLint + Prettier |
| Web Scraping | Firecrawl | Puppeteer, Playwright |
| AI Agents | OpenAI Agents SDK | LangChain, custom |
