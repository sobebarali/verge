---
title: AI Extraction
description: "[PLANNED] LLM-powered data extraction"
---

:::caution[Planned Feature]
This feature is planned for future development and is not yet implemented.
:::

## Overview

AI Extraction will use Large Language Models to intelligently extract structured data from web pages based on natural language prompts.

## Core Concept

Instead of using CSS selectors or XPath, users describe what data they want in plain English:

```
"Extract the company name, pricing tiers, and main features from this SaaS website"
```

The AI will:
1. Understand the page structure
2. Identify relevant content
3. Extract and structure the data
4. Return typed results

## Planned Features

### Natural Language Prompts

```typescript
// User provides a prompt
const prompt = "Get the product name, price, and rating from this product page";

// AI extracts matching data
{
  productName: "Example Product",
  price: "$29.99",
  rating: 4.5
}
```

### Schema Definition

Optional output schema for type safety:

```typescript
const schema = z.object({
  productName: z.string(),
  price: z.string(),
  rating: z.number(),
  inStock: z.boolean(),
});
```

### Batch Extraction

Process multiple URLs with the same prompt:

```typescript
const results = await scrape.batchExtract({
  urls: ["https://site1.com", "https://site2.com"],
  prompt: "Extract company name and employee count",
});
```

## Technical Architecture

### LLM Integration

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Raw HTML   │────▶│  LLM API    │────▶│ Structured  │
│   Content   │     │ (GPT/Claude)│     │    JSON     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Planned Flow

1. Fetch webpage content
2. Clean and prepare HTML
3. Send to LLM with prompt
4. Parse LLM response
5. Validate against schema
6. Return structured data

## API Design

### `ai.extract`

**Planned Input**:
```typescript
z.object({
  url: z.string().url(),
  prompt: z.string(),
  schema: z.any().optional(),
  options: z.object({
    renderJs: z.boolean().optional(),
    timeout: z.number().optional(),
  }).optional(),
})
```

**Planned Output**:
```typescript
{
  data: unknown;  // Matches schema if provided
  confidence: number;
  tokensUsed: number;
}
```

## Implementation Considerations

1. **Token Management**: Optimize HTML to reduce token usage
2. **Caching**: Cache results for identical URL + prompt
3. **Fallback**: Use traditional extraction if AI fails
4. **Cost Control**: Monitor and limit LLM API usage
5. **Accuracy**: Validate and score extraction quality

## Related

- [Web Scraping API](/roadmap/web-scraping-api/) - Core scraping
- [Prompt Queries](/roadmap/prompt-queries/) - Natural language queries
