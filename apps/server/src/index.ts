import "dotenv/config";
import { config } from "./config";
import "@verge/api/types";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@verge/api/context";
import { logger } from "@verge/api/logger";
import { pinoLogger } from "@verge/api/middleware";
import { appRouter } from "@verge/api/routers/index";
import { auth } from "@verge/auth";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { authRateLimiter, rateLimiter } from "./middleware/security";
import { healthCheck, livenessCheck, readinessCheck } from "./routes/health";

const app = new Hono();

app.use("*", requestId());
app.use(pinoLogger(logger));
app.use(
	secureHeaders({
		strictTransportSecurity:
			config.NODE_ENV === "production"
				? "max-age=31536000; includeSubDomains"
				: false,
		xFrameOptions: "DENY",
		xContentTypeOptions: "nosniff",
		referrerPolicy: "strict-origin-when-cross-origin",
		permissionsPolicy: {
			camera: [],
			microphone: [],
			geolocation: [],
		},
	}),
);
app.use(
	bodyLimit({
		maxSize: 1024 * 1024,
		onError: (c) => c.json({ error: "Payload too large" }, 413),
	}),
);
app.use("/api/*", timeout(30000));
app.use("/trpc/*", timeout(30000));
app.use(rateLimiter({ skipPaths: ["/health", "/"] }));
app.use(
	"/*",
	cors({
		origin: config.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
		credentials: true,
	}),
);

app.use("/api/auth/*", authRateLimiter);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => createContext({ context }),
	}),
);

app.get("/", (c) => c.text("OK"));
app.get("/health", healthCheck);
app.get("/health/ready", readinessCheck);
app.get("/health/live", livenessCheck);

app.onError((err, c) => {
	const reqLogger = c.get("logger") || logger;
	reqLogger.error({ err }, "Unhandled error");
	return c.json({ error: "Internal Server Error" }, 500);
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
	if (isShuttingDown) {
		logger.warn({ signal }, "Shutdown already in progress");
		return;
	}

	isShuttingDown = true;
	logger.info({ signal }, "Graceful shutdown initiated");

	try {
		const mongoose = await import("mongoose");
		if (mongoose.connection.readyState === 1) {
			await mongoose.connection.close();
			logger.info("Database connection closed");
		}
	} catch (error) {
		logger.error({ error }, "Error during shutdown");
	}

	logger.info("Shutdown complete");
	process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

logger.info({ port: config.PORT, env: config.NODE_ENV }, "Server starting...");

export default app;
