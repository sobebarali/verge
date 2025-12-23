import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../index";
import { mapFirecrawlError } from "../_shared/errors";
import { extractDataInput, extractDataOutput } from "./extract-data.schema";
import { extractData as extractDataService } from "./extract-data.service";

export const extractDataHandler = protectedProcedure
	.input(extractDataInput)
	.output(extractDataOutput)
	.mutation(async ({ input, ctx }) => {
		const { logger, session } = ctx;

		logger.info(
			{ url: input.url, userId: session.user?.id, hasSchema: !!input.outputSchema },
			"Extract data request initiated",
		);

		try {
			const result = await extractDataService(input, logger);

			logger.info(
				{ url: input.url, userId: session.user?.id, hasData: !!result.data },
				"Extract data completed successfully",
			);

			return result;
		} catch (error) {
			if (error instanceof TRPCError) throw error;

			logger.error({ url: input.url, error }, "Firecrawl API error");
			mapFirecrawlError(error);
		}
	});
