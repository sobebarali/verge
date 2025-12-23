import { TRPCError } from "@trpc/server";

export function mapFirecrawlError(error: unknown): never {
	const msg = (error instanceof Error ? error.message : "").toLowerCase();

	if (msg.includes("rate limit")) {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: "Rate limit exceeded. Please try again later.",
		});
	}

	if (msg.includes("timeout")) {
		throw new TRPCError({
			code: "TIMEOUT",
			message:
				"The request timed out. The page may be too large or slow to respond.",
		});
	}

	if (msg.includes("not found") || msg.includes("404")) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "The URL could not be found or is not accessible.",
		});
	}

	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: "An error occurred while scraping the URL",
		cause: error,
	});
}
