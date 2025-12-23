import { z } from "zod";

const envSchema = z.object({
	// Server
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),

	// Database
	DATABASE_URL: z
		.string()
		.min(1, "DATABASE_URL is required")
		.refine(
			(url) => url.startsWith("mongodb://") || url.startsWith("mongodb+srv://"),
			"DATABASE_URL must be a valid MongoDB connection string",
		),

	// Authentication
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
	BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

	// CORS
	CORS_ORIGIN: z.string().url("CORS_ORIGIN must be a valid URL"),

	// Polar (optional in development)
	POLAR_ACCESS_TOKEN: z.string().optional(),
	POLAR_SUCCESS_URL: z.string().optional(),

	// Logging
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),

	// Firecrawl
	FIRECRAWL_API_KEY: z
		.string()
		.min(1, "FIRECRAWL_API_KEY is required")
		.refine(
			(key) => key.startsWith("fc-"),
			"FIRECRAWL_API_KEY must start with 'fc-'",
		),
});

function validateEnv() {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ Invalid environment variables:");
		for (const issue of result.error.issues) {
			console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}

	return result.data;
}

export const config = validateEnv();

export type Config = z.infer<typeof envSchema>;
