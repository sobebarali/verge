import "dotenv/config";
import { config } from "./config";
import "@verge/api/types";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@verge/api/context";
import { logger } from "@verge/api/logger";
import { pinoLogger, requestId } from "@verge/api/middleware";
import { appRouter } from "@verge/api/routers/index";
import { auth } from "@verge/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
	authRateLimiter,
	rateLimiter,
	securityHeaders,
} from "./middleware/security";
import { healthCheck, livenessCheck, readinessCheck } from "./routes/health";

const app = new Hono();

// Middleware order matters:
// 1. Request ID first - generates unique ID for request tracing
app.use(requestId);
// 2. Pino logger - attaches logger with request context
app.use(pinoLogger(logger));
// 3. Security headers
app.use(securityHeaders);
// 4. Rate limiting (skip health check)
app.use(rateLimiter({ skipPaths: ["/health", "/"] }));
// 5. CORS
app.use(
	"/*",
	cors({
		origin: config.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "x-request-id"],
		credentials: true,
	}),
);

// Auth routes with stricter rate limiting
app.use("/api/auth/*", authRateLimiter);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

// Health check endpoints
app.get("/", (c) => c.text("OK"));
app.get("/health", healthCheck);
app.get("/health/ready", readinessCheck);
app.get("/health/live", livenessCheck);

// Global error handler
app.onError((err, c) => {
	const reqLogger = c.get("logger") || logger;
	reqLogger.error({ err }, "Unhandled error");
	return c.json({ error: "Internal Server Error" }, 500);
});

// Graceful shutdown handling
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
	if (isShuttingDown) {
		logger.warn({ signal }, "Shutdown already in progress");
		return;
	}

	isShuttingDown = true;
	logger.info({ signal }, "Graceful shutdown initiated");

	try {
		// Import mongoose dynamically to close connection
		const mongoose = await import("mongoose");
		if (mongoose.connection.readyState === 1) {
			logger.info("Closing database connection...");
			await mongoose.connection.close();
			logger.info("Database connection closed");
		}
	} catch (error) {
		logger.error({ error }, "Error during shutdown");
	}

	logger.info("Shutdown complete");
	process.exit(0);
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Log server startup
logger.info({ port: config.PORT, env: config.NODE_ENV }, "Server starting...");

export default app;
