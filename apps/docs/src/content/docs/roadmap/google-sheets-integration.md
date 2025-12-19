---
title: Google Sheets Integration
description: "[PLANNED] Native Google Sheets integration"
---

:::caution[Planned Feature]
This feature is planned for future development and is not yet implemented.
:::

## Overview

Google Sheets Integration will allow users to directly export scraped data to Google Sheets, making Verge accessible from within the spreadsheet environment.

## Planned Features

### Direct Export

Export scraping results directly to a Google Sheet:

```
Scraping Job → Verge API → Google Sheets
```

### Google Sheets Add-on

A custom function for Google Sheets:

```
=VERGE("https://example.com", "Extract company name and pricing")
```

### Scheduled Updates

Automatically refresh data on a schedule:

- Hourly
- Daily
- Weekly
- Custom cron

## Integration Architecture

### OAuth Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Verge     │────▶│  Google     │
│  Connects   │     │   OAuth     │     │   OAuth     │
│   Sheets    │     │   Handler   │     │   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Scraping   │────▶│   Verge     │────▶│  Sheets     │
│    Job      │     │    API      │     │    API      │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Planned API

### `sheets.connect`

Connect a Google Sheets account.

**Type**: Mutation (Protected)

**Flow**:
1. Generate OAuth URL
2. User authorizes access
3. Store refresh token
4. Return success

### `sheets.export`

Export data to a sheet.

**Planned Input**:
```typescript
z.object({
  spreadsheetId: z.string(),
  sheetName: z.string().optional(),
  data: z.array(z.record(z.unknown())),
  mode: z.enum(["append", "replace"]),
})
```

### `sheets.createSchedule`

Create a scheduled export.

**Planned Input**:
```typescript
z.object({
  scrapingJobId: z.string(),
  spreadsheetId: z.string(),
  schedule: z.enum(["hourly", "daily", "weekly"]),
})
```

## Google Sheets Add-on

### Custom Function

```javascript
/**
 * Extracts data from a URL using Verge AI
 * @param {string} url The URL to scrape
 * @param {string} prompt What data to extract
 * @return Extracted data
 * @customfunction
 */
function VERGE(url, prompt) {
  // Call Verge API
  // Return structured data
}
```

### Sidebar

A sidebar UI for:
- Managing API keys
- Viewing job history
- Configuring schedules

## Implementation Considerations

1. **Google OAuth**: Implement OAuth 2.0 flow
2. **Refresh Tokens**: Securely store and refresh tokens
3. **Rate Limits**: Respect Google Sheets API limits
4. **Add-on Review**: Submit for Google Workspace Marketplace
5. **Permissions**: Request minimal scopes

## Database Schema

### SheetsConnection Model

```typescript
const sheetsConnectionSchema = new Schema({
  _id: String,
  userId: { type: String, ref: "User", required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  email: String,
  createdAt: Date,
});
```

### ExportSchedule Model

```typescript
const exportScheduleSchema = new Schema({
  _id: String,
  userId: { type: String, ref: "User", required: true },
  scrapingJobId: { type: String, ref: "ScrapingJob" },
  spreadsheetId: { type: String, required: true },
  sheetName: String,
  schedule: { type: String, enum: ["hourly", "daily", "weekly"] },
  lastRunAt: Date,
  nextRunAt: Date,
  enabled: { type: Boolean, default: true },
});
```

## Related

- [Web Scraping API](/roadmap/web-scraping-api/) - Data source
- [AI Extraction](/roadmap/ai-extraction/) - Intelligent extraction
