---
title: Web Scraping API
description: "[PLANNED] Core web scraping endpoints"
---

:::caution[Planned Feature]
This feature is planned for future development and is not yet implemented.
:::

## Overview

The Web Scraping API will provide endpoints for extracting data from websites.

## Planned Endpoints

### `scrape.extractData`

Extract structured data from a URL.

**Type**: Mutation (Protected)

**Planned Input**:
```typescript
z.object({
  url: z.string().url(),
  prompt: z.string(),
  outputSchema: z.object({}).optional(),
})
```

**Planned Output**:
```typescript
{
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: unknown;
}
```

### `scrape.getJob`

Get the status of a scraping job.

**Type**: Query (Protected)

**Planned Input**:
```typescript
z.object({
  jobId: z.string(),
})
```

### `scrape.listJobs`

List scraping jobs for the current user.

**Type**: Query (Protected)

## Planned Features

### URL Validation

- Valid URL format
- Domain allowlist/blocklist
- Rate limiting per domain

### Content Extraction

- HTML parsing
- JavaScript rendering (optional)
- Screenshot capture

### Output Formats

- JSON structured data
- Raw HTML
- Text content

## Database Schema

### ScrapingJob Model

```typescript
const scrapingJobSchema = new Schema({
  _id: String,
  url: { type: String, required: true },
  prompt: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "running", "completed", "failed"],
    default: "pending",
  },
  result: Schema.Types.Mixed,
  error: String,
  userId: { type: String, ref: "User", required: true },
  createdAt: Date,
  completedAt: Date,
});
```

## Implementation Considerations

1. **Rate Limiting**: Prevent abuse and respect target sites
2. **Job Queue**: Process jobs asynchronously
3. **Caching**: Cache results for repeated requests
4. **Error Handling**: Graceful handling of failed requests
5. **Monitoring**: Track success rates and response times

## Related

- [AI Extraction](/roadmap/ai-extraction/) - LLM-powered extraction
- [Google Sheets Integration](/roadmap/google-sheets-integration/) - Data export
