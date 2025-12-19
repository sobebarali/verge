---
title: API Reference
description: Complete API reference for Verge backend services
---

This section provides comprehensive documentation for all Verge API endpoints and services.

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000` |
| Production | TBD |

## API Endpoints

| Path | Description |
|------|-------------|
| `/trpc/*` | tRPC endpoints for type-safe API calls |
| `/api/auth/*` | Better-Auth authentication endpoints |
| `GET /` | Health check endpoint |

## Architecture

The API is built with:

- **Hono** - Lightweight HTTP framework
- **tRPC** - End-to-end type-safe API layer
- **Better-Auth** - Authentication and session management
- **Polar** - Payment processing

## Sections

### tRPC

- [Setup & Conventions](/api/trpc/) - tRPC initialization and patterns
- [Context](/api/trpc/context/) - Request context and session handling
- [Procedures](/api/trpc/procedures/) - Public vs protected procedures
- [Routers](/api/trpc/routers/) - Available endpoints

### Authentication

- [Overview](/api/authentication/) - Better-Auth configuration
- [Endpoints](/api/authentication/endpoints/) - Auth API routes
- [Email & Password](/api/authentication/email-password/) - Email/password flow
- [Session Management](/api/authentication/session-management/) - Cookies and tokens
- [Client Integration](/api/authentication/client-integration/) - React auth client

### Payments

- [Overview](/api/payments/) - Polar integration
- [Checkout](/api/payments/checkout/) - Checkout flow
- [Customer Portal](/api/payments/customer-portal/) - Portal access

### Error Handling

- [Overview](/api/errors/) - Error handling patterns
- [Error Codes](/api/errors/error-codes/) - tRPC error codes reference
