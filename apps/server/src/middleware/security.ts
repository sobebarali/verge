import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

/**
 * Security headers middleware - equivalent to helmet
 */
export const securityHeaders = createMiddleware(async (c, next) => {
	await next();

	// Prevent MIME type sniffing
	c.res.headers.set("X-Content-Type-Options", "nosniff");

	// Prevent clickjacking
	c.res.headers.set("X-Frame-Options", "DENY");

	// XSS Protection (legacy browsers)
	c.res.headers.set("X-XSS-Protection", "1; mode=block");

	// Referrer policy
	c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Permissions policy
	c.res.headers.set(
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=()",
	);

	// Strict Transport Security (only in production)
	if (process.env.NODE_ENV === "production") {
		c.res.headers.set(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		);
	}
});

/**
 * Simple in-memory rate limiter
 */
interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const store: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
	const now = Date.now();
	for (const key of Object.keys(store)) {
		const entry = store[key];
		if (entry && entry.resetTime < now) {
			delete store[key];
		}
	}
}, 60000); // Clean every minute

interface RateLimitOptions {
	windowMs?: number; // Time window in milliseconds
	max?: number; // Max requests per window
	keyGenerator?: (c: Context) => string;
	skipPaths?: string[];
}

export const rateLimiter = (options: RateLimitOptions = {}) => {
	const {
		windowMs = 60 * 1000, // 1 minute default
		max = 100, // 100 requests per minute default
		keyGenerator = (c) =>
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
		skipPaths = [],
	} = options;

	return createMiddleware(async (c: Context, next: Next) => {
		// Skip rate limiting for specified paths
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

		// Set rate limit headers
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

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // 10 attempts per 15 minutes
	keyGenerator: (c) => {
		const ip =
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
		return `auth:${ip}`;
	},
});
