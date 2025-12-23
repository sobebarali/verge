# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/api/package*.json ./packages/api/
COPY packages/auth/package*.json ./packages/auth/
COPY packages/db/package*.json ./packages/db/
COPY packages/config/package*.json ./packages/config/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN bun run build --filter=server

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy built files
COPY --from=builder --chown=hono:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/apps/server/package.json ./package.json

USER hono

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1

# Start the server
CMD ["bun", "run", "dist/index.js"]
