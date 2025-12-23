import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { logger as baseLogger } from "./logger";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

// Logging middleware for public procedures
const loggerMiddleware = t.middleware(({ ctx, next, path, type }) => {
	const userId = ctx.session?.user?.id;

	const logger = ctx.logger
		? ctx.logger.child({ userId, procedure: path, type })
		: baseLogger.child({ userId, procedure: path, type });

	logger.debug("Procedure called");

	return next({
		ctx: {
			...ctx,
			logger,
		},
	});
});

export const publicProcedure = t.procedure.use(loggerMiddleware);

// Combined auth + logging middleware for protected procedures
// This ensures session is validated and type-narrowed in one step
const protectedMiddleware = t.middleware(({ ctx, next, path, type }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}

	const userId = ctx.session.user?.id;

	const logger = ctx.logger
		? ctx.logger.child({ userId, procedure: path, type })
		: baseLogger.child({ userId, procedure: path, type });

	logger.debug("Procedure called");

	return next({
		ctx: {
			...ctx,
			session: ctx.session,
			logger,
		},
	});
});

export const protectedProcedure = t.procedure.use(protectedMiddleware);
