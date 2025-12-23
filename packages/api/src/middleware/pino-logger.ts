import { createMiddleware } from "hono/factory";
import type { Logger } from "../logger";

export const pinoLogger = (logger: Logger) =>
	createMiddleware(async (c, next) => {
		const start = Date.now();
		const requestId = c.get("requestId") as string | undefined;
		const method = c.req.method;
		const path = c.req.path;

		// Create child logger with request context
		const reqLogger = logger.child({ requestId, method, path });
		c.set("logger", reqLogger);

		reqLogger.info("Request started");

		try {
			await next();
		} catch (error) {
			// Log error with stack trace and request body
			let requestBody: string | null = null;
			try {
				requestBody = await c.req.text();
			} catch {
				// Body may have already been consumed
			}

			const session = c.get("session") as
				| { user?: { id?: string } }
				| undefined;

			reqLogger.error(
				{
					err: error,
					requestBody,
					userId: session?.user?.id,
				},
				"Request failed",
			);
			throw error;
		}

		const duration = Date.now() - start;
		const status = c.res.status;
		const session = c.get("session") as { user?: { id?: string } } | undefined;

		reqLogger.info(
			{ status, duration, userId: session?.user?.id },
			"Request completed",
		);
	});
