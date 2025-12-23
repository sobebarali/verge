import { protectedProcedure, publicProcedure, router } from "../index";
import { scrapeRouter } from "./scrape";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	scrape: scrapeRouter,
});
export type AppRouter = typeof appRouter;
