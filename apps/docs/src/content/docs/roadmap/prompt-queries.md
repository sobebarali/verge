---
title: Prompt Queries
description: "[PLANNED] Natural language data queries"
---

:::caution[Planned Feature]
This feature is planned for future development and is not yet implemented.
:::

## Technology Choice

**OpenAI Agents SDK (Python)** - Multi-agent framework with function tools for natural language → database query conversion. Runs as a separate microservice at `apps/agents/`. See [Technology Decisions](/architecture/technology-decisions/) for rationale.

## Overview

Prompt Queries will allow users to query their scraped data using natural language, making data retrieval intuitive for non-technical users. Powered by OpenAI Agents SDK.

## Core Concept

Instead of writing queries, users describe what they want:

```
"Show me all companies with more than 100 employees that we scraped last week"
```

The system:
1. Parses the natural language query
2. Converts to database query
3. Executes and returns results
4. Formats for display

## Planned Features

### Natural Language Search

```typescript
// User query
"Find all e-commerce sites with free shipping"

// System understands and executes
db.scrapingJobs.find({
  "result.freeShipping": true,
  "result.category": "e-commerce",
})
```

### Aggregations

```typescript
// User query
"What's the average price across all product pages we scraped?"

// System calculates
{
  averagePrice: 49.99,
  minPrice: 9.99,
  maxPrice: 299.99,
  count: 150,
}
```

### Comparisons

```typescript
// User query
"Compare pricing between Site A and Site B"

// System generates comparison
{
  siteA: { avgPrice: 29.99, products: 50 },
  siteB: { avgPrice: 34.99, products: 45 },
}
```

## Technical Architecture

### Query Processing

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Natural    │────▶│   LLM       │────▶│  Database   │
│  Language   │     │  Parser     │     │    Query    │
└─────────────┘     └─────────────┘     └─────────────┘
        │                                      │
        │                                      ▼
        │                               ┌─────────────┐
        │                               │   Results   │
        │                               └──────┬──────┘
        │                                      │
        ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│                  Formatted Response                  │
└─────────────────────────────────────────────────────┘
```

## Planned API

### `query.natural`

Execute a natural language query.

**Type**: Query (Protected)

**Planned Input**:
```typescript
z.object({
  query: z.string(),
  dataSource: z.enum(["jobs", "results", "all"]).optional(),
  limit: z.number().optional(),
})
```

**Planned Output**:
```typescript
{
  results: unknown[];
  interpretation: string;  // How the query was understood
  count: number;
}
```

### `query.suggest`

Get query suggestions.

**Type**: Query (Protected)

**Planned Input**:
```typescript
z.object({
  partial: z.string(),
})
```

**Planned Output**:
```typescript
{
  suggestions: string[];
}
```

## Example Queries

| Natural Language | Interpretation |
|------------------|----------------|
| "All failed jobs" | `{ status: "failed" }` |
| "Jobs from yesterday" | `{ createdAt: { $gte: yesterday } }` |
| "Companies with > 50 employees" | `{ "result.employees": { $gt: 50 } }` |
| "Average price by category" | Aggregation pipeline |
| "Latest 10 jobs" | `{ limit: 10, sort: { createdAt: -1 } }` |

## UI Components

### Query Input

```
┌────────────────────────────────────────────────────┐
│ 🔍 What would you like to find?                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Show me all companies with pricing info        │ │
│ └────────────────────────────────────────────────┘ │
│ [Search]                                           │
└────────────────────────────────────────────────────┘
```

### Results Display

- Table view with sorting
- Card view for rich data
- Export options (CSV, JSON, Sheets)

## Implementation Considerations

1. **Query Safety**: Prevent injection attacks
2. **Performance**: Limit result sets
3. **Caching**: Cache common queries
4. **Feedback Loop**: Learn from user corrections
5. **Fallback**: Show manual filters if parsing fails

## Related

- [AI Extraction](/roadmap/ai-extraction/) - LLM-powered extraction
- [Web Scraping API](/roadmap/web-scraping-api/) - Data source
- [Google Sheets Integration](/roadmap/google-sheets-integration/) - Data export
