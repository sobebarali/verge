import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const store: RateLimitStore = {};

setInterval(() => {
	const now = Date.now();
	for (const key of Object.keys(store)) {
		const entry = store[key];
		if (entry && entry.resetTime < now) {
			delete store[key];
		}
	}
}, 60000);

interface RateLimitOptions {
	windowMs?: number;
	max?: number;
	keyGenerator?: (c: Context) => string;
	skipPaths?: string[];
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
	const {
		windowMs = 60 * 1000,
		max = 100,
		keyGenerator = (c) =>
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
		skipPaths = [],
	} = options;

	return createMiddleware(async (c: Context, next: Next) => {
		if (skipPaths.some((path) => c.req.path.startsWith(path))) {
			return next();
		}

		const key = keyGenerator(c);
		const now = Date.now();

		if (!store[key] || store[key].resetTime < now) {
			store[key] = {
				count: 1,
				resetTime: now + windowMs,
			};
		} else {
			store[key].count++;
		}

		const remaining = Math.max(0, max - store[key].count);
		const resetTime = Math.ceil(store[key].resetTime / 1000);

		c.res.headers.set("X-RateLimit-Limit", String(max));
		c.res.headers.set("X-RateLimit-Remaining", String(remaining));
		c.res.headers.set("X-RateLimit-Reset", String(resetTime));

		if (store[key].count > max) {
			c.res.headers.set("Retry-After", String(Math.ceil(windowMs / 1000)));
			return c.json(
				{
					error: "Too Many Requests",
					message: "Rate limit exceeded. Please try again later.",
				},
				429,
			);
		}

		return next();
	});
};

export const authRateLimiter = rateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 10,
	keyGenerator: (c) => {
		const ip =
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
		return `auth:${ip}`;
	},
});
