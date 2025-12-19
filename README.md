# Verge

**Supercharge your spreadsheet with an AI-powered web scraper. Extract any data from any website into your Google Sheets in seconds.**

## The Problem

GTM teams struggle heavily with data enrichment, especially in the SMB space. Existing tools can't consistently get the data you need because that data lives on the prospect's site—not on LinkedIn or other common sources used for Enterprise.

Most enrichment tools also aren't intuitive for non-technical folks.

## The Solution

Verge is an AI data extraction tool built right into Google Sheets. No new tools, no new dependencies—just prompt and get the data you need.

Built on a platform that many GTM teams are already familiar with, Verge makes web scraping accessible to everyone.

## Tech Stack

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Bun** - Runtime environment
- **Mongoose** - TypeScript-first ORM
- **MongoDB** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system
- **Starlight** - Documentation site with Astro
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality

## Getting Started

First, install the dependencies:

```bash
npm install
```
## Database Setup

This project uses MongoDB with Mongoose.

1. Make sure you have MongoDB set up.
2. Update your `apps/server/.env` file with your MongoDB connection URI.

3. Apply the schema to your database:
```bash
npm run db:push
```


Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).







## Project Structure

```
verge/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── docs/        # Documentation site (Astro Starlight)
│   └── server/      # Backend API (Hono, TRPC)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open database studio UI
- `npm run check`: Run Biome formatting and linting
- `cd apps/docs && npm run dev`: Start documentation site
- `cd apps/docs && npm run build`: Build documentation site
