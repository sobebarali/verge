import { describe, expect, it } from "vitest";
import { z } from "zod";

// Define the schema here for testing (mirrors the actual config schema)
const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z
		.string()
		.min(1, "DATABASE_URL is required")
		.refine(
			(url) => url.startsWith("mongodb://") || url.startsWith("mongodb+srv://"),
			"DATABASE_URL must be a valid MongoDB connection string",
		),
	BETTER_AUTH_SECRET: z
		.string()
		.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
	BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
	CORS_ORIGIN: z.string().url("CORS_ORIGIN must be a valid URL"),
	POLAR_ACCESS_TOKEN: z.string().optional(),
	POLAR_SUCCESS_URL: z.string().optional(),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
});

describe("Config Schema Validation", () => {
	const validEnv = {
		NODE_ENV: "development",
		PORT: "3000",
		DATABASE_URL: "mongodb://localhost:27017/testdb",
		BETTER_AUTH_SECRET: "this-is-a-very-long-secret-key-at-least-32-chars",
		BETTER_AUTH_URL: "http://localhost:3000",
		CORS_ORIGIN: "http://localhost:3001",
	};

	it("should validate correct environment variables", () => {
		const result = envSchema.safeParse(validEnv);
		expect(result.success).toBe(true);
	});

	it("should fail with missing DATABASE_URL", () => {
		const { DATABASE_URL, ...envWithoutDb } = validEnv;
		const result = envSchema.safeParse(envWithoutDb);
		expect(result.success).toBe(false);
	});

	it("should fail with invalid DATABASE_URL format", () => {
		const result = envSchema.safeParse({
			...validEnv,
			DATABASE_URL: "invalid-url",
		});
		expect(result.success).toBe(false);
	});

	it("should fail with short BETTER_AUTH_SECRET", () => {
		const result = envSchema.safeParse({
			...validEnv,
			BETTER_AUTH_SECRET: "short",
		});
		expect(result.success).toBe(false);
	});

	it("should fail with invalid CORS_ORIGIN URL", () => {
		const result = envSchema.safeParse({
			...validEnv,
			CORS_ORIGIN: "not-a-url",
		});
		expect(result.success).toBe(false);
	});

	it("should accept mongodb+srv:// connection strings", () => {
		const result = envSchema.safeParse({
			...validEnv,
			DATABASE_URL: "mongodb+srv://user:pass@cluster.mongodb.net/db",
		});
		expect(result.success).toBe(true);
	});

	it("should use defaults for optional fields", () => {
		const result = envSchema.safeParse(validEnv);
		if (result.success) {
			expect(result.data.NODE_ENV).toBe("development");
			expect(result.data.PORT).toBe(3000);
			expect(result.data.LOG_LEVEL).toBe("info");
		}
	});
});
