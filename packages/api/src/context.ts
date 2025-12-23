import { auth } from "@verge/auth";
import type { Context as HonoContext } from "hono";
import type { Logger } from "./logger";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	// Get logger from Hono context (set by pinoLogger middleware)
	const logger = context.get("logger") as Logger;

	return {
		session,
		logger,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
