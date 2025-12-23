import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { mapFirecrawlError } from "../../../../src/routers/scrape/_shared/errors";

describe("mapFirecrawlError", () => {
	describe("rate limit errors", () => {
		it("maps rate limit error to TOO_MANY_REQUESTS", () => {
			const error = new Error("Rate limit exceeded");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect(e).toBeInstanceOf(TRPCError);
				expect((e as TRPCError).code).toBe("TOO_MANY_REQUESTS");
			}
		});

		it("handles case-insensitive rate limit messages", () => {
			const error = new Error("RATE LIMIT hit for this API key");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect((e as TRPCError).code).toBe("TOO_MANY_REQUESTS");
			}
		});
	});

	describe("timeout errors", () => {
		it("maps timeout error to TIMEOUT", () => {
			const error = new Error("Request timeout after 30s");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect(e).toBeInstanceOf(TRPCError);
				expect((e as TRPCError).code).toBe("TIMEOUT");
			}
		});
	});

	describe("not found errors", () => {
		it("maps not found error to NOT_FOUND", () => {
			const error = new Error("Page not found");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect(e).toBeInstanceOf(TRPCError);
				expect((e as TRPCError).code).toBe("NOT_FOUND");
			}
		});

		it("maps 404 error to NOT_FOUND", () => {
			const error = new Error("HTTP 404: Resource unavailable");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect((e as TRPCError).code).toBe("NOT_FOUND");
			}
		});
	});

	describe("generic errors", () => {
		it("maps unknown errors to INTERNAL_SERVER_ERROR", () => {
			const error = new Error("Something unexpected happened");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect(e).toBeInstanceOf(TRPCError);
				expect((e as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
			}
		});

		it("preserves original error as cause", () => {
			const original = new Error("Original error");

			try {
				mapFirecrawlError(original);
			} catch (e) {
				expect((e as TRPCError).cause).toBe(original);
			}
		});
	});

	describe("error priority", () => {
		it("rate limit takes priority over timeout", () => {
			const error = new Error("Rate limit timeout");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect((e as TRPCError).code).toBe("TOO_MANY_REQUESTS");
			}
		});

		it("timeout takes priority over not found", () => {
			const error = new Error("Timeout while trying to find page");

			try {
				mapFirecrawlError(error);
			} catch (e) {
				expect((e as TRPCError).code).toBe("TIMEOUT");
			}
		});
	});
});
